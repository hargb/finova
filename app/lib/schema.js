import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(50, "Account name cannot exceed 50 characters"),

  type: z.enum(["CURRENT", "SAVINGS"]),

  balance: z
    .coerce
    .number({
      required_error: "Initial balance is required",
      invalid_type_error: "Balance must be a number",
    })
    .finite("Balance must be a valid number")
    .min(0, "Balance must be 0 or greater"),

  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),

    amount: z
      .coerce
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .finite("Amount must be a valid number")
      .positive("Amount must be greater than 0"),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    date: z.date({
      required_error: "Date is required",
      invalid_type_error: "Invalid transaction date",
    }),

    accountId: z
      .string()
      .trim()
      .min(1, "Account is required"),

    category: z
      .string()
      .trim()
      .min(1, "Category is required")
      .max(50, "Category cannot exceed 50 characters"),

    isRecurring: z.boolean().default(false),

    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }

    if (!data.isRecurring && data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Recurring interval should only be set for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });