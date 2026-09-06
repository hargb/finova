"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/prisma";

const serializeTransaction = (obj) => {
  if (!obj) return obj;

  const serialized = { ...obj };

  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

const getCurrentUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return db.user.findUnique({
    where: {
      ClerkUserid: userId,
    },
  });
};

export async function updateDefaultAccount(accountId) {
  try {
    if (!accountId) {
      return {
        success: false,
        error: "Account ID is required",
      };
    }

    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    await db.$transaction(async (tx) => {
      await tx.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          isDefault: true,
        },
      });
    });

    const updatedAccount = await db.account.findUnique({
      where: {
        id: account.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${account.id}`);

    return {
      success: true,
      data: serializeTransaction(updatedAccount),
    };
  } catch (error) {
    console.error("updateDefaultAccount error:", error);

    return {
      success: false,
      error: "Failed to update default account",
    };
  }
}

export async function getAccountWithTransactions(accountId) {
  try {
    if (!accountId) {
      return null;
    }

    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },

        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      return null;
    }

    return {
      ...serializeTransaction(account),

      transactions: account.transactions.map(
        serializeTransaction
      ),
    };
  } catch (error) {
    console.error("getAccountWithTransactions error:", error);

    return null;
  }
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    if (
      !Array.isArray(transactionIds) ||
      transactionIds.length === 0
    ) {
      return {
        success: false,
        error: "No transactions selected",
      };
    }

    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
      select: {
        id: true,
        accountId: true,
        type: true,
        amount: true,
      },
    });

    if (transactions.length === 0) {
      return {
        success: false,
        error: "No valid transactions found",
      };
    }

    /*
     * When deleting:
     *
     * EXPENSE:
     *   Original balance = balance - expense
     *   Delete expense => balance + expense
     *
     * INCOME:
     *   Original balance = balance + income
     *   Delete income => balance - income
     */

    const accountBalanceChanges = {};

    for (const transaction of transactions) {
      const amount = new Prisma.Decimal(transaction.amount);

      const change =
        transaction.type === "EXPENSE"
          ? amount
          : amount.negated();

      if (!accountBalanceChanges[transaction.accountId]) {
        accountBalanceChanges[transaction.accountId] =
          new Prisma.Decimal(0);
      }

      accountBalanceChanges[transaction.accountId] =
        accountBalanceChanges[transaction.accountId].add(change);
    }

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: {
            in: transactions.map((transaction) => transaction.id),
          },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.updateMany({
          where: {
            id: accountId,
            userId: user.id,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return {
      success: true,
      deletedCount: transactions.length,
    };
  } catch (error) {
    console.error("bulkDeleteTransactions error:", error);

    return {
      success: false,
      error: "Failed to delete transactions",
    };
  }
}