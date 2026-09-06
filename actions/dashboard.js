"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { accountSchema } from "@/app/lib/schema";

/* ============================================================
   SERIALIZATION
============================================================ */

const serializeFinancialData = (obj) => {
  if (!obj) return obj;

  const serialized = { ...obj };

  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance =
      typeof obj.balance?.toNumber === "function"
        ? obj.balance.toNumber()
        : Number(obj.balance);
  }

  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount =
      typeof obj.amount?.toNumber === "function"
        ? obj.amount.toNumber()
        : Number(obj.amount);
  }

  if (obj.account?.balance !== undefined && obj.account.balance !== null) {
    serialized.account = {
      ...obj.account,
      balance:
        typeof obj.account.balance?.toNumber === "function"
          ? obj.account.balance.toNumber()
          : Number(obj.account.balance),
    };
  }

  return serialized;
};

/* ============================================================
   AUTHENTICATION + USER SYNC
============================================================ */

/**
 * Gets the currently authenticated Clerk user and makes sure
 * a corresponding Finova User exists in PostgreSQL.
 *
 * This is important for a fresh database because Clerk users
 * and application users are stored separately.
 */
async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First try to find the user in our database.
  let user = await db.user.findUnique({
    where: {
      ClerkUserid: userId,
    },

    select: {
      id: true,
      ClerkUserid: true,
      email: true,
      name: true,
    },
  });

  // User exists → return immediately.
  if (user) {
    return user;
  }

  /* ----------------------------------------------------------
     FIRST LOGIN / FRESH DATABASE
  ---------------------------------------------------------- */

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to fetch Clerk user");
  }

  const primaryEmail =
    clerkUser.emailAddresses?.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("Clerk user has no email address");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;

  /* ----------------------------------------------------------
     CREATE FINOVA USER
  ---------------------------------------------------------- */

  try {
    user = await db.user.create({
      data: {
        ClerkUserid: userId,
        email: primaryEmail,
        name,
        imageUrl: clerkUser.imageUrl || null,
      },

      select: {
        id: true,
        ClerkUserid: true,
        email: true,
        name: true,
      },
    });

    return user;
  } catch (error) {
    /*
     * Protect against a race condition where two requests
     * try to create the same Clerk user simultaneously.
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingUser = await db.user.findUnique({
        where: {
          ClerkUserid: userId,
        },

        select: {
          id: true,
          ClerkUserid: true,
          email: true,
          name: true,
        },
      });

      if (existingUser) {
        return existingUser;
      }
    }

    throw error;
  }
}

/* ============================================================
   VALIDATION
============================================================ */

function validateAccountData(data) {
  const result = accountSchema.safeParse({
    name: data?.name,
    type: data?.type,
    balance: data?.balance,
    isDefault: Boolean(data?.isDefault),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Invalid account data");
  }

  return result.data;
}

/* ============================================================
   CREATE ACCOUNT
============================================================ */

export async function createAccount(data) {
  try {
    const user = await getAuthenticatedUser();

    const validatedData = validateAccountData(data);

    const account = await db.$transaction(async (tx) => {
      /**
       * The first account should always become default.
       *
       * If the user explicitly selects this account as default,
       * the previous default account is unset first.
       */

      const existingAccounts = await tx.account.findMany({
        where: {
          userId: user.id,
        },

        select: {
          id: true,
        },
      });

      const shouldBeDefault =
        existingAccounts.length === 0 || validatedData.isDefault;

      if (shouldBeDefault) {
        await tx.account.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
          },

          data: {
            isDefault: false,
          },
        });
      }

      return tx.account.create({
        data: {
          name: validatedData.name,
          type: validatedData.type,

          balance: new Prisma.Decimal(validatedData.balance),

          isDefault: shouldBeDefault,

          userId: user.id,
        },
      });
    });

    revalidatePath("/dashboard");

    return {
      success: true,

      data: serializeFinancialData(account),
    };
  } catch (error) {
    console.error("Error creating account:", error);

    return {
      success: false,

      error:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

/* ============================================================
   GET USER ACCOUNTS
============================================================ */

export async function getUserAccounts() {
  try {
    const user = await getAuthenticatedUser();

    const accounts = await db.account.findMany({
      where: {
        userId: user.id,
      },

      orderBy: [
        {
          isDefault: "desc",
        },

        {
          createdAt: "desc",
        },
      ],

      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return accounts.map(serializeFinancialData);
  } catch (error) {
    console.error("Error fetching accounts:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch accounts",
    );
  }
}

/* ============================================================
   GET DASHBOARD DATA
============================================================ */

/**
 * Returns completed transactions for the authenticated user.
 *
 * Pending and failed transactions are excluded from dashboard
 * calculations.
 */
export async function getDashboardData() {
  try {
    const user = await getAuthenticatedUser();

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,

        status: "COMPLETED",
      },

      orderBy: {
        date: "desc",
      },

      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return transactions.map(serializeFinancialData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch dashboard data",
    );
  }
}
