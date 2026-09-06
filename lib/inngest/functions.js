import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";

const GEMINI_MODEL =
  process.env.GEMINI_INSIGHTS_MODEL || "gemini-1.5-flash";

/* ============================================================
   HELPERS
============================================================ */

function getMonthBoundaries(date = new Date()) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const next = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );

  return {
    start,
    next,
  };
}

function isNewMonth(lastDate, currentDate) {
  return (
    lastDate.getMonth() !== currentDate.getMonth() ||
    lastDate.getFullYear() !== currentDate.getFullYear()
  );
}

function isTransactionDue(transaction, now = new Date()) {
  if (!transaction.isRecurring) {
    return false;
  }

  if (!transaction.recurringInterval) {
    return false;
  }

  if (!transaction.nextRecurringDate) {
    return !transaction.lastProcessed;
  }

  const nextDue = new Date(transaction.nextRecurringDate);

  return (
    !Number.isNaN(nextDue.getTime()) &&
    nextDue <= now
  );
}

/**
 * Handles month-end dates correctly.
 *
 * Example:
 * Jan 31 + 1 month => Feb 28/29
 *
 * Instead of JavaScript Date automatically
 * overflowing into March.
 */
function calculateNextRecurringDate(date, interval) {
  const source = new Date(date);

  if (Number.isNaN(source.getTime())) {
    throw new Error("Invalid recurring transaction date");
  }

  switch (interval) {
    case "DAILY": {
      const next = new Date(source);
      next.setDate(next.getDate() + 1);
      return next;
    }

    case "WEEKLY": {
      const next = new Date(source);
      next.setDate(next.getDate() + 7);
      return next;
    }

    case "MONTHLY": {
      const year = source.getFullYear();
      const month = source.getMonth();

      const lastDayOfTargetMonth = new Date(
        year,
        month + 2,
        0
      ).getDate();

      const targetDay = Math.min(
        source.getDate(),
        lastDayOfTargetMonth
      );

      return new Date(
        year,
        month + 1,
        targetDay,
        source.getHours(),
        source.getMinutes(),
        source.getSeconds(),
        source.getMilliseconds()
      );
    }

    case "YEARLY": {
      const year = source.getFullYear() + 1;

      // Handles Feb 29 -> Feb 28 in non-leap year.
      const lastDayOfTargetMonth = new Date(
        year,
        source.getMonth() + 1,
        0
      ).getDate();

      const targetDay = Math.min(
        source.getDate(),
        lastDayOfTargetMonth
      );

      return new Date(
        year,
        source.getMonth(),
        targetDay,
        source.getHours(),
        source.getMinutes(),
        source.getSeconds(),
        source.getMilliseconds()
      );
    }

    default:
      throw new Error(
        `Unsupported recurring interval: ${interval}`
      );
  }
}

function getBalanceImpact(type, amount) {
  const decimalAmount = new Prisma.Decimal(amount);

  return type === "EXPENSE"
    ? decimalAmount.negated()
    : decimalAmount;
}

/* ============================================================
   BUDGET ALERTS
============================================================ */

export const checkBudgetAlert = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
    triggers: [
      {
        cron: "0 */6 * * *",
      },
    ],
  },

  async ({ step }) => {
    const budgets = await step.run(
      "fetch-budgets",
      async () => {
        return db.budget.findMany({
          include: {
            user: {
              include: {
                accounts: {
                  where: {
                    isDefault: true,
                  },
                  take: 1,
                },
              },
            },
          },
        });
      }
    );

    let alertsSent = 0;

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];

      if (!defaultAccount) {
        continue;
      }

      const result = await step.run(
        `check-budget-${budget.id}`,
        async () => {
          const now = new Date();

          const { start, next } =
            getMonthBoundaries(now);

          const budgetAmount =
            budget.amount.toNumber();

          if (
            !Number.isFinite(budgetAmount) ||
            budgetAmount <= 0
          ) {
            return {
              skipped: true,
              reason: "Invalid budget amount",
            };
          }

          const expenses =
            await db.transaction.aggregate({
              where: {
                userId: budget.userId,
                accountId: defaultAccount.id,
                type: "EXPENSE",
                status: "COMPLETED",
                date: {
                  gte: start,
                  lt: next,
                },
              },

              _sum: {
                amount: true,
              },
            });

          const totalExpenses =
            expenses._sum.amount?.toNumber() ?? 0;

          const percentageUsed =
            (totalExpenses / budgetAmount) * 100;

          const alreadySent =
            budget.lastAlertSent &&
            !isNewMonth(
              new Date(budget.lastAlertSent),
              now
            );

          if (
            percentageUsed < 80 ||
            alreadySent
          ) {
            return {
              skipped: true,
              percentageUsed,
            };
          }

          const emailResult = await sendEmail({
            to: budget.user.email,

            subject:
              `Budget Alert for ${defaultAccount.name}`,

            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",

              data: {
                percentageUsed,
                budgetAmount:
                  budgetAmount.toFixed(2),
                totalExpenses:
                  totalExpenses.toFixed(2),
                accountName:
                  defaultAccount.name,
              },
            }),
          });

          if (!emailResult.success) {
            throw new Error(
              emailResult.error ||
                "Failed to send budget alert email"
            );
          }

          await db.budget.update({
            where: {
              id: budget.id,
            },

            data: {
              lastAlertSent: new Date(),
            },
          });

          return {
            sent: true,
            percentageUsed,
          };
        }
      );

      if (result?.sent) {
        alertsSent++;
      }
    }

    return {
      processed: budgets.length,
      alertsSent,
    };
  }
);

/* ============================================================
   RECURRING TRANSACTION TRIGGER
============================================================ */

export const triggerRecurringTransactions =
  inngest.createFunction(
    {
      id: "trigger-recurring-transactions",
      name: "Trigger Recurring Transactions",

      triggers: [
        {
          cron: "0 0 * * *",
        },
      ],
    },

    async ({ step }) => {
      const now = new Date();

      const recurringTransactions =
        await step.run(
          "fetch-recurring-transactions",
          async () => {
            return db.transaction.findMany({
              where: {
                isRecurring: true,
                status: "COMPLETED",

                OR: [
                  {
                    nextRecurringDate: {
                      lte: now,
                    },
                  },
                  {
                    nextRecurringDate: null,
                    lastProcessed: null,
                  },
                ],
              },

              select: {
                id: true,
                userId: true,
              },
            });
          }
        );

      if (
        recurringTransactions.length === 0
      ) {
        return {
          triggered: 0,
        };
      }

      const events =
        recurringTransactions.map(
          (transaction) => ({
            name:
              "transaction.recurring.process",

            data: {
              transactionId:
                transaction.id,

              userId:
                transaction.userId,
            },
          })
        );

      await inngest.send(events);

      return {
        triggered: events.length,
      };
    }
  );

/* ============================================================
   PROCESS RECURRING TRANSACTION
============================================================ */

export const processRecurringTransaction =
  inngest.createFunction(
    {
      id: "process-recurring-transaction",
      name: "Process Recurring Transaction",

      triggers: [
        {
          event:
            "transaction.recurring.process",
        },
      ],

      throttle: {
        limit: 10,
        period: "1m",
        key: "event.data.userId",
      },
    },

    async ({ event, step }) => {
      const transactionId =
        event?.data?.transactionId;

      const userId =
        event?.data?.userId;

      if (!transactionId || !userId) {
        console.error(
          "Invalid recurring transaction event:",
          event
        );

        return {
          processed: false,
          error:
            "Missing transactionId or userId",
        };
      }

      const result = await step.run(
        "process-recurring-transaction",
        async () => {
          const now = new Date();

          const transaction =
            await db.transaction.findFirst({
              where: {
                id: transactionId,
                userId,
                isRecurring: true,
                status: "COMPLETED",
              },

              include: {
                account: true,
              },
            });

          if (!transaction) {
            return {
              processed: false,
              reason:
                "Recurring transaction not found",
            };
          }

          if (
            !isTransactionDue(
              transaction,
              now
            )
          ) {
            return {
              processed: false,
              reason:
                "Transaction is not due",
            };
          }

          if (
            !transaction.recurringInterval
          ) {
            return {
              processed: false,
              reason:
                "Recurring interval missing",
            };
          }

          const scheduledDate =
            transaction.nextRecurringDate
              ? new Date(
                  transaction.nextRecurringDate
                )
              : new Date(
                  transaction.date
                );

          const nextRecurringDate =
            calculateNextRecurringDate(
              scheduledDate,
              transaction.recurringInterval
            );

          /**
           * Entire operation is atomic.
           *
           * The recurring row is advanced BEFORE
           * another worker can process the same due date.
           *
           * If transaction creation fails,
           * the whole DB transaction rolls back.
           */
          return db.$transaction(
            async (tx) => {
              const claimWhere =
                transaction.nextRecurringDate
                  ? {
                      id: transaction.id,
                      userId,
                      isRecurring: true,
                      status: "COMPLETED",
                      nextRecurringDate:
                        transaction.nextRecurringDate,
                    }
                  : {
                      id: transaction.id,
                      userId,
                      isRecurring: true,
                      status: "COMPLETED",
                      nextRecurringDate: null,
                      lastProcessed: null,
                    };

              const claimed =
                await tx.transaction.updateMany({
                  where: claimWhere,

                  data: {
                    lastProcessed: now,
                    nextRecurringDate,
                  },
                });

              /**
               * Another worker already claimed
               * this scheduled occurrence.
               */
              if (claimed.count === 0) {
                return {
                  processed: false,
                  reason:
                    "Already processed",
                };
              }

              const createdTransaction =
                await tx.transaction.create({
                  data: {
                    type: transaction.type,

                    amount:
                      transaction.amount,

                    description:
                      transaction.description
                        ? `${transaction.description} (Recurring)`
                        : "Recurring transaction",

                    date: now,

                    category:
                      transaction.category,

                    receiptUrl: null,

                    isRecurring: false,

                    recurringInterval: null,

                    nextRecurringDate: null,

                    lastProcessed: null,

                    status: "COMPLETED",

                    userId:
                      transaction.userId,

                    accountId:
                      transaction.accountId,
                  },
                });

              const balanceChange =
                getBalanceImpact(
                  transaction.type,
                  transaction.amount
                );

              const accountUpdate =
                await tx.account.updateMany({
                  where: {
                    id:
                      transaction.accountId,

                    userId:
                      transaction.userId,
                  },

                  data: {
                    balance: {
                      increment:
                        balanceChange,
                    },
                  },
                });

              if (
                accountUpdate.count === 0
              ) {
                throw new Error(
                  "Recurring transaction account not found"
                );
              }

              return {
                processed: true,

                transactionId:
                  createdTransaction.id,

                nextRecurringDate,
              };
            }
          );
        }
      );

      return result;
    }
  );

/* ============================================================
   MONTHLY FINANCIAL REPORT
============================================================ */

export const generateMonthlyReports =
  inngest.createFunction(
    {
      id: "generate-monthly-reports",
      name: "Generate Monthly Reports",

      triggers: [
        {
          cron: "0 0 1 * *",
        },
      ],
    },

    async ({ step }) => {
      const users = await step.run(
        "fetch-users",
        async () => {
          return db.user.findMany({
            select: {
              id: true,
              email: true,
              name: true,
            },
          });
        }
      );

      let reportsSent = 0;

      const currentDate = new Date();

      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );

      const monthName =
        lastMonth.toLocaleString(
          "default",
          {
            month: "long",
          }
        );

      for (const user of users) {
        const result = await step.run(
          `generate-report-${user.id}`,
          async () => {
            const stats =
              await getMonthlyStats(
                user.id,
                lastMonth
              );

            const insights =
              await generateFinancialInsights(
                stats,
                monthName
              );

            const emailResult =
              await sendEmail({
                to: user.email,

                subject:
                  `Your Monthly Financial Report - ${monthName}`,

                react: EmailTemplate({
                  userName: user.name,
                  type: "monthly-report",

                  data: {
                    stats,
                    month: monthName,
                    insights,
                  },
                }),
              });

            if (!emailResult.success) {
              throw new Error(
                emailResult.error ||
                  "Failed to send monthly report"
              );
            }

            return {
              sent: true,
            };
          }
        );

        if (result?.sent) {
          reportsSent++;
        }
      }

      return {
        processed: users.length,
        reportsSent,
      };
    }
  );

/* ============================================================
   GEMINI FINANCIAL INSIGHTS
============================================================ */

async function generateFinancialInsights(
  stats,
  month
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured"
      );
    }

    const genAI =
      new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
      );

    const model =
      genAI.getGenerativeModel({
        model: GEMINI_MODEL,
      });

    const categoryBreakdown =
      Object.entries(stats.byCategory)
        .map(
          ([category, amount]) =>
            `${category}: ₹${amount.toFixed(2)}`
        )
        .join(", ");

    const netIncome =
      stats.totalIncome -
      stats.totalExpenses;

    const prompt = `
Analyze this user's monthly financial data.

Month: ${month}

Total Income: ₹${stats.totalIncome.toFixed(2)}
Total Expenses: ₹${stats.totalExpenses.toFixed(2)}
Net Income: ₹${netIncome.toFixed(2)}

Expense Categories:
${
  categoryBreakdown ||
  "No expenses recorded"
}

Provide exactly 3 concise, actionable financial insights.

Focus on:
- spending patterns
- unusually high categories
- practical savings advice
- budgeting opportunities

Keep the language friendly and conversational.

Return ONLY valid JSON.

Required format:

[
  "insight 1",
  "insight 2",
  "insight 3"
]
`;

    const result =
      await model.generateContent(
        prompt
      );

    const text =
      result.response.text().trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed =
      JSON.parse(cleanedText);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0
    ) {
      throw new Error(
        "Invalid insights response from Gemini"
      );
    }

    const insights = parsed
      .filter(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0
      )
      .map((item) => item.trim())
      .slice(0, 3);

    if (insights.length === 0) {
      throw new Error(
        "Gemini returned no valid insights"
      );
    }

    return insights;
  } catch (error) {
    console.error(
      "Error generating financial insights:",
      error
    );

    return [
      "Review your highest spending category and look for areas where you can reduce unnecessary expenses.",

      "Compare your total expenses with your income to understand how much you are saving each month.",

      "Consider setting or adjusting your monthly budget based on your recent spending patterns.",
    ];
  }
}

/* ============================================================
   MONTHLY STATS
============================================================ */

async function getMonthlyStats(
  userId,
  month
) {
  const { start, next } =
    getMonthBoundaries(month);

  const transactions =
    await db.transaction.findMany({
      where: {
        userId,

        status: "COMPLETED",

        date: {
          gte: start,
          lt: next,
        },
      },

      select: {
        type: true,
        amount: true,
        category: true,
      },
    });

  return transactions.reduce(
    (stats, transaction) => {
      const amount =
        transaction.amount.toNumber();

      if (
        transaction.type ===
        "EXPENSE"
      ) {
        stats.totalExpenses += amount;

        stats.byCategory[
          transaction.category
        ] =
          (stats.byCategory[
            transaction.category
          ] || 0) + amount;
      }

      if (
        transaction.type ===
        "INCOME"
      ) {
        stats.totalIncome += amount;
      }

      return stats;
    },

    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount:
        transactions.length,
    }
  );
}