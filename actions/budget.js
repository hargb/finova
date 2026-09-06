"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

/* ============================================================
   HELPERS
============================================================ */

function validateBudgetAmount(amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Budget amount must be greater than zero"
    );
  }

  if (numericAmount > 999999999) {
    throw new Error(
      "Budget amount is too large"
    );
  }

  return new Prisma.Decimal(numericAmount);
}

async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      ClerkUserid: userId,
    },

    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

function getCurrentMonthBoundaries() {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  return {
    startOfMonth,
    startOfNextMonth,
  };
}

/* ============================================================
   GET CURRENT BUDGET
============================================================ */

/**
 * Get the authenticated user's current-month
 * budget and total expenses.
 *
 * Budget is user-level, so expenses from ALL
 * user's accounts are included.
 */
export async function getCurrentBudget() {
  try {
    const user = await getAuthenticatedUser();

    const { startOfMonth, startOfNextMonth } =
      getCurrentMonthBoundaries();

    const [budget, expenses] =
      await Promise.all([
        db.budget.findUnique({
          where: {
            userId: user.id,
          },
        }),

        db.transaction.aggregate({
          where: {
            userId: user.id,
            type: "EXPENSE",
            status: "COMPLETED",
            date: {
              gte: startOfMonth,
              lt: startOfNextMonth,
            },
          },

          _sum: {
            amount: true,
          },
        }),
      ]);

    const currentExpenses =
      expenses._sum.amount?.toNumber() ?? 0;

    return {
      budget: budget
        ? {
            id: budget.id,
            amount: budget.amount.toNumber(),
            lastAlertSent:
              budget.lastAlertSent,
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt,
          }
        : null,

      currentExpenses,
    };
  } catch (error) {
    console.error(
      "Error fetching budget:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch budget"
    );
  }
}

/* ============================================================
   CREATE / UPDATE BUDGET
============================================================ */

/**
 * Create or update the authenticated user's
 * monthly budget.
 *
 * Prisma schema allows one budget per user.
 */
export async function updateBudget(amount) {
  try {
    const numericAmount =
      validateBudgetAmount(amount);

    const user =
      await getAuthenticatedUser();

    const budget =
      await db.budget.upsert({
        where: {
          userId: user.id,
        },

        update: {
          amount: numericAmount,

          /**
           * Reset the alert when the budget
           * itself changes.
           *
           * This allows the user to receive a
           * fresh alert for the new budget.
           */
          lastAlertSent: null,
        },

        create: {
          userId: user.id,
          amount: numericAmount,
        },
      });

    revalidatePath("/dashboard");

    return {
      success: true,

      data: {
        id: budget.id,
        amount: budget.amount.toNumber(),
        lastAlertSent:
          budget.lastAlertSent,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
    };
  } catch (error) {
    console.error(
      "Error updating budget:",
      error
    );

    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Failed to update budget",
    };
  }
}