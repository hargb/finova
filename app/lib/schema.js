import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.coerce
    .number({ required_error: "Initial balance is required", invalid_type_error: "Balance must be a number" })
   .min(0, "Balance must be 0 or greater"),
  isDefault: z.boolean().default(false), 
})

export const transactionSchema = z.object({
 type: z.enum(["INCOME","EXPENSE"]),
 amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
 description: z.string().optional(),
 date: z.date({ required_error: "Date is required" }),
 accountId: z.string().min(1, "Account is required"),
 category: z.string().min(1, "Category is required"),
 isRecurring: z.boolean().default(false),
 recurringInterval: z
   .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
   .optional(),
  
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recurring interval is required for recurring transactions",
      path: ["recurringInterval"],
    });
  }
});
