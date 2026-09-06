"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";

import { db } from "@/lib/prisma";

/* ============================================================
   CONFIG
============================================================ */

const DAYS_TO_SEED = 90;
const MIN_TRANSACTIONS_PER_DAY = 1;
const MAX_TRANSACTIONS_PER_DAY = 3;

const CATEGORIES = {
  INCOME: [
    {
      name: "salary",
      range: [5000, 8000],
    },
    {
      name: "freelance",
      range: [1000, 3000],
    },
    {
      name: "investments",
      range: [500, 2000],
    },
    {
      name: "other-income",
      range: [100, 1000],
    },
  ],

  EXPENSE: [
    {
      name: "housing",
      range: [1000, 2000],
    },
    {
      name: "transportation",
      range: [100, 500],
    },
    {
      name: "groceries",
      range: [200, 600],
    },
    {
      name: "utilities",
      range: [100, 300],
    },
    {
      name: "entertainment",
      range: [50, 200],
    },
    {
      name: "food",
      range: [50, 150],
    },
    {
      name: "shopping",
      range: [100, 500],
    },
    {
      name: "healthcare",
      range: [100, 1000],
    },
    {
      name: "education",
      range: [200, 1000],
    },
    {
      name: "travel",
      range: [500, 2000],
    },
  ],
};

/* ============================================================
   HELPERS
============================================================ */

function getRandomAmount(min, max) {
  return new Prisma.Decimal(
    (Math.random() * (max - min) + min).toFixed(2)
  );
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];

  if (!categories?.length) {
    throw new Error(
      `No categories configured for ${type}`
    );
  }

  const category =
    categories[
      Math.floor(
        Math.random() * categories.length
      )
    ];

  return {
    category: category.name,
    amount: getRandomAmount(
      category.range[0],
      category.range[1]
    ),
  };
}

function getRandomTransactionsPerDay() {
  return (
    Math.floor(
      Math.random() *
        (
          MAX_TRANSACTIONS_PER_DAY -
          MIN_TRANSACTIONS_PER_DAY +
          1
        )
    ) + MIN_TRANSACTIONS_PER_DAY
  );
}

/* ============================================================
   SEED TRANSACTIONS
============================================================ */

export async function seedTransactions() {
  try {
    /**
     * Never expose seed functionality in production.
     */
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Transaction seeding is disabled in production."
      );
    }

    /* --------------------------------------------------------
       AUTHENTICATION
    -------------------------------------------------------- */

    const { userId: clerkUserId } =
      await auth();

    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    const user =
      await db.user.findUnique({
        where: {
          ClerkUserid: clerkUserId,
        },

        select: {
          id: true,
        },
      });

    if (!user) {
      throw new Error("User not found");
    }

    /* --------------------------------------------------------
       GENERATE TRANSACTIONS
    -------------------------------------------------------- */

    const transactions = [];

    for (
      let daysAgo = DAYS_TO_SEED;
      daysAgo >= 0;
      daysAgo--
    ) {
      const date = subDays(
        new Date(),
        daysAgo
      );

      const transactionsPerDay =
        getRandomTransactionsPerDay();

      for (
        let index = 0;
        index < transactionsPerDay;
        index++
      ) {
        const type =
          Math.random() < 0.4
            ? "INCOME"
            : "EXPENSE";

        const {
          category,
          amount,
        } = getRandomCategory(type);

        transactions.push({
          type,

          amount,

          description:
            type === "INCOME"
              ? `Received ${category}`
              : `Paid for ${category}`,

          date,

          category,

          receiptUrl: null,

          isRecurring: false,

          recurringInterval: null,

          nextRecurringDate: null,

          lastProcessed: null,

          status: "COMPLETED",

          userId: user.id,

          createdAt: date,

          updatedAt: date,
        });
      }
    }

    if (!transactions.length) {
      throw new Error(
        "No demo transactions were generated."
      );
    }

    /* --------------------------------------------------------
       ATOMIC DATABASE OPERATION
    -------------------------------------------------------- */

    const result =
      await db.$transaction(
        async (tx) => {
          /**
           * Find default account.
           */
          let account =
            await tx.account.findFirst({
              where: {
                userId: user.id,
                isDefault: true,
              },

              orderBy: {
                createdAt: "asc",
              },
            });

          /**
           * If no default account exists,
           * use the oldest account.
           */
          if (!account) {
            account =
              await tx.account.findFirst({
                where: {
                  userId: user.id,
                },

                orderBy: {
                  createdAt: "asc",
                },
              });
          }

          /**
           * Create demo account if user has
           * no accounts.
           */
          if (!account) {
            account =
              await tx.account.create({
                data: {
                  name: "Demo Account",

                  type: "CURRENT",

                  balance:
                    new Prisma.Decimal(0),

                  isDefault: true,

                  userId: user.id,
                },
              });
          }

          /**
           * Attach every generated transaction
           * to the selected account.
           */
          const transactionsWithAccount =
            transactions.map(
              (transaction) => ({
                ...transaction,

                accountId:
                  account.id,
              })
            );

          /**
           * Remove existing transactions belonging
           * to this user + account.
           */
          const deleted =
            await tx.transaction.deleteMany({
              where: {
                userId: user.id,

                accountId:
                  account.id,
              },
            });

          /**
           * Calculate resulting balance using
           * Decimal arithmetic.
           */
          let totalBalance =
            new Prisma.Decimal(0);

          for (
            const transaction of
            transactionsWithAccount
          ) {
            if (
              transaction.type ===
              "INCOME"
            ) {
              totalBalance =
                totalBalance.add(
                  transaction.amount
                );
            } else {
              totalBalance =
                totalBalance.sub(
                  transaction.amount
                );
            }
          }

          /**
           * Insert generated transactions.
           */
          await tx.transaction.createMany({
            data:
              transactionsWithAccount,
          });

          /**
           * Set balance exactly to the
           * generated transaction balance.
           */
          const updatedAccount =
            await tx.account.update({
              where: {
                id: account.id,
              },

              data: {
                balance:
                  totalBalance,
              },
            });

          return {
            accountId:
              updatedAccount.id,

            accountName:
              updatedAccount.name,

            deletedCount:
              deleted.count,

            createdCount:
              transactions.length,

            balance:
              totalBalance.toNumber(),
          };
        }
      );

    /* --------------------------------------------------------
       CACHE INVALIDATION
    -------------------------------------------------------- */

    revalidatePath("/dashboard");

    revalidatePath(
      `/account/${result.accountId}`
    );

    return {
      success: true,

      message:
        `Created ${result.createdCount} demo transactions.`,

      data: result,
    };
  } catch (error) {
    console.error(
      "Error seeding transactions:",
      error
    );

    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Failed to seed transactions",
    };
  }
}