"use server";

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";

import { db } from "@/lib/prisma";
import aj from "@/lib/arcjet";
import { transactionSchema } from "@/app/lib/schema";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const serializeFinancialData = (obj) => {
  if (!obj) return obj;

  const serialized = { ...obj };

  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount =
      typeof obj.amount?.toNumber === "function"
        ? obj.amount.toNumber()
        : Number(obj.amount);
  }

  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance =
      typeof obj.balance?.toNumber === "function"
        ? obj.balance.toNumber()
        : Number(obj.balance);
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

const getCurrentUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      ClerkUserid: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    clerkUserId: userId,
    user,
  };
};

const getDecimalAmount = (value) => {
  try {
    const amount = new Prisma.Decimal(value);

    if (!amount.isFinite() || amount.lte(0)) {
      throw new Error("Amount must be greater than zero");
    }

    return amount;
  } catch {
    throw new Error("Invalid transaction amount");
  }
};

const getBalanceImpact = (type, amount) => {
  const decimalAmount = getDecimalAmount(amount);

  return type === "EXPENSE"
    ? decimalAmount.negated()
    : decimalAmount;
};

const validateTransactionData = (data) => {
  if (!data) {
    throw new Error("Transaction data is required");
  }

  const parsed = transactionSchema.safeParse({
    ...data,
    amount:
      data.amount !== undefined && data.amount !== null
        ? Number(data.amount)
        : data.amount,
    date:
      data.date instanceof Date
        ? data.date
        : data.date
          ? new Date(data.date)
          : data.date,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0];

    throw new Error(
      firstError?.message || "Invalid transaction data"
    );
  }

  return parsed.data;
};

const calculateNextRecurringDate = (startDate, interval) => {
  const date = new Date(startDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid recurring transaction date");
  }

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;

    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;

    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;

    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;

    default:
      throw new Error("Invalid recurring interval");
  }

  return date;
};

const checkArcjet = async (clerkUserId) => {
  const req = await request();

  const decision = await aj.protect(req, {
    userId: clerkUserId,
    requested: 1,
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      throw new Error(
        "Too many requests. Please try again later."
      );
    }

    throw new Error("Request blocked");
  }
};

/* -------------------------------------------------------------------------- */
/* Create Transaction                                                         */
/* -------------------------------------------------------------------------- */

export async function createTransaction(data) {
  try {
    const validatedData = validateTransactionData(data);

    const { clerkUserId, user } = await getCurrentUser();

    await checkArcjet(clerkUserId);

    const account = await db.account.findFirst({
      where: {
        id: validatedData.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const amount = getDecimalAmount(validatedData.amount);

    const balanceImpact = getBalanceImpact(
      validatedData.type,
      amount
    );

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: validatedData.type,

          amount,

          description:
            validatedData.description?.trim() || null,

          date: new Date(validatedData.date),

          category: validatedData.category,

          receiptUrl: data.receiptUrl || null,

          isRecurring: Boolean(validatedData.isRecurring),

          recurringInterval:
            validatedData.isRecurring
              ? validatedData.recurringInterval
              : null,

          nextRecurringDate:
            validatedData.isRecurring
              ? calculateNextRecurringDate(
                  validatedData.date,
                  validatedData.recurringInterval
                )
              : null,

          lastProcessed: null,

          status: "COMPLETED",

          userId: user.id,

          accountId: account.id,
        },
      });

      await tx.account.updateMany({
        where: {
          id: account.id,
          userId: user.id,
        },
        data: {
          balance: {
            increment: balanceImpact,
          },
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return {
      success: true,
      data: serializeFinancialData(transaction),
    };
  } catch (error) {
    console.error("Error creating transaction:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create transaction",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Get Single Transaction                                                     */
/* -------------------------------------------------------------------------- */

export async function getTransaction(id) {
  try {
    if (!id) {
      throw new Error("Transaction ID is required");
    }

    const { user } = await getCurrentUser();

    const transaction = await db.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return serializeFinancialData(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch transaction"
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Update Transaction                                                         */
/* -------------------------------------------------------------------------- */

export async function updateTransaction(id, data) {
  try {
    if (!id) {
      throw new Error("Transaction ID is required");
    }

    const validatedData = validateTransactionData(data);

    const { clerkUserId, user } = await getCurrentUser();

    await checkArcjet(clerkUserId);

    let oldAccountId = null;

    const updatedTransaction = await db.$transaction(
      async (tx) => {
        /* ---------------------- Original transaction ---------------------- */

        const originalTransaction =
          await tx.transaction.findFirst({
            where: {
              id,
              userId: user.id,
            },
          });

        if (!originalTransaction) {
          throw new Error("Transaction not found");
        }

        oldAccountId = originalTransaction.accountId;

        /* -------------------------- New account --------------------------- */

        const newAccount = await tx.account.findFirst({
          where: {
            id: validatedData.accountId,
            userId: user.id,
          },
        });

        if (!newAccount) {
          throw new Error("Account not found");
        }

        const oldBalanceImpact = getBalanceImpact(
          originalTransaction.type,
          originalTransaction.amount
        );

        const newBalanceImpact = getBalanceImpact(
          validatedData.type,
          validatedData.amount
        );

        const oldAccountIdValue =
          originalTransaction.accountId;

        const newAccountIdValue = newAccount.id;

        /* ---------------- Same account ---------------- */

        if (
          oldAccountIdValue ===
          newAccountIdValue
        ) {
          const netBalanceChange =
            newBalanceImpact.sub(oldBalanceImpact);

          await tx.account.updateMany({
            where: {
              id: oldAccountIdValue,
              userId: user.id,
            },
            data: {
              balance: {
                increment: netBalanceChange,
              },
            },
          });
        }

        /* ---------------- Different account ---------------- */

        else {
          // Reverse old transaction impact
          await tx.account.updateMany({
            where: {
              id: oldAccountIdValue,
              userId: user.id,
            },
            data: {
              balance: {
                increment: oldBalanceImpact.negated(),
              },
            },
          });

          // Apply new transaction impact
          await tx.account.updateMany({
            where: {
              id: newAccountIdValue,
              userId: user.id,
            },
            data: {
              balance: {
                increment: newBalanceImpact,
              },
            },
          });
        }

        /* -------------------- Update transaction -------------------- */

        const updated = await tx.transaction.update({
          where: {
            id,
          },

          data: {
            type: validatedData.type,

            amount: getDecimalAmount(
              validatedData.amount
            ),

            description:
              validatedData.description?.trim() || null,

            date: new Date(validatedData.date),

            category: validatedData.category,

            receiptUrl: data.receiptUrl || null,

            isRecurring: Boolean(
              validatedData.isRecurring
            ),

            recurringInterval:
              validatedData.isRecurring
                ? validatedData.recurringInterval
                : null,

            nextRecurringDate:
              validatedData.isRecurring
                ? calculateNextRecurringDate(
                    validatedData.date,
                    validatedData.recurringInterval
                  )
                : null,

            // Reset processing state when recurring configuration changes
            lastProcessed: null,

            accountId: newAccountIdValue,
          },
        });

        return updated;
      }
    );

    revalidatePath("/dashboard");

    // Important when transaction moves between accounts
    if (oldAccountId) {
      revalidatePath(`/account/${oldAccountId}`);
    }

    revalidatePath(
      `/account/${updatedTransaction.accountId}`
    );

    return {
      success: true,
      data: serializeFinancialData(
        updatedTransaction
      ),
    };
  } catch (error) {
    console.error("Error updating transaction:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update transaction",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Get User Transactions                                                      */
/* -------------------------------------------------------------------------- */

export async function getUserTransactions(query = {}) {
  try {
    const { user } = await getCurrentUser();

    /*
     * Never allow caller to override userId.
     *
     * Only allow known safe filters.
     */

    const allowedFilters = [
      "accountId",
      "type",
      "category",
      "isRecurring",
      "status",
    ];

    const safeQuery = {};

    for (const key of allowedFilters) {
      if (
        Object.prototype.hasOwnProperty.call(
          query,
          key
        )
      ) {
        safeQuery[key] = query[key];
      }
    }

    /*
     * accountId must belong to current user.
     */
    if (safeQuery.accountId) {
      const account = await db.account.findFirst({
        where: {
          id: safeQuery.accountId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!account) {
        throw new Error("Account not found");
      }
    }

    const transactions =
      await db.transaction.findMany({
        where: {
          userId: user.id,
          ...safeQuery,
        },

        include: {
          account: true,
        },

        orderBy: {
          date: "desc",
        },
      });

    return {
      success: true,
      data: transactions.map(
        serializeFinancialData
      ),
    };
  } catch (error) {
    console.error(
      "Error fetching transactions:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch transactions"
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Receipt Scanner                                                            */
/* -------------------------------------------------------------------------- */

export async function scanReceipt(file) {
  try {
    if (!file) {
      throw new Error("Receipt file is required");
    }

    if (!(file instanceof File)) {
      throw new Error("Invalid receipt file");
    }

    if (!genAI) {
      throw new Error(
        "Gemini API key is not configured"
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        "Receipt image must be smaller than 5MB"
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(
        "Unsupported receipt format"
      );
    }

    const { clerkUserId } = await getCurrentUser();

    await checkArcjet(clerkUserId);

    const model = genAI.getGenerativeModel({
      model:
        process.env.GEMINI_RECEIPT_MODEL ||
        "gemini-1.5-flash",
    });

    const arrayBuffer = await file.arrayBuffer();

    const base64String =
      Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Analyze this receipt and extract the following information.

Return ONLY valid JSON.
Do not include markdown.
Do not include \`\`\`json.
Do not include explanations.

Required format:

{
  "amount": number,
  "date": "ISO date string",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}

Rules:
- amount must be a positive number
- date must be a valid ISO date
- description should summarize the purchase
- merchantName should contain the merchant/store name
- category should be a reasonable expense category
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const text = result.response
      .text()
      .trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedData;

    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Gemini raw response:",
        text
      );

      console.error(
        "JSON parse error:",
        parseError
      );

      throw new Error(
        "Invalid response format from Gemini"
      );
    }

    const amount = Number(
      parsedData?.amount
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Invalid amount extracted from receipt"
      );
    }

    const parsedDate = new Date(
      parsedData?.date
    );

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      throw new Error(
        "Invalid date extracted from receipt"
      );
    }

    const description =
      typeof parsedData?.description === "string"
        ? parsedData.description.trim()
        : "";

    const merchantName =
      typeof parsedData?.merchantName === "string"
        ? parsedData.merchantName.trim()
        : "";

    const category =
      typeof parsedData?.category === "string" &&
      parsedData.category.trim()
        ? parsedData.category.trim()
        : "OTHER";

    return {
      amount,
      date: parsedDate,
      description,
      category,
      merchantName,
    };
  } catch (error) {
    console.error(
      "Receipt scan error:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to scan receipt"
    );
  }
}