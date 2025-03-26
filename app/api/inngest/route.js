import {inngest} from "@/lib/inngest/client";
import {serve} from "inngest/next";
import {checkBudgetAlert, processRecurringTransaction,
  triggerRecurringTransactions, generateMonthlyReports} from "@/lib/inngest/functions";
import{ helloWorld } from "@/lib/inngest/functions";
export const {GET,POST,PUT} = serve({
  client: inngest,
  functions:[
checkBudgetAlert,
processRecurringTransaction,
    triggerRecurringTransactions,
    generateMonthlyReports,
  
  
  ],
});