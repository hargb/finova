import { Inngest } from "inngest";

/**
 * Finova Inngest client.
 *
 * Used for:
 * - recurring transactions
 * - budget alerts
 * - monthly financial reports
 * - background events
 */
export const inngest = new Inngest({
  id: "finova",
  name: "Finova",

  retryFunction: async (attempt) => ({
    delay: Math.min(
      2 ** attempt * 1000,
      30_000
    ),
    maxAttempts: 3,
  }),
});