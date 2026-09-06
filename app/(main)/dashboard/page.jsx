export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { CreateAccountDrawer } from "@/components/ui/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";

import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";

import AccountCard from "./_components/account-card";
import { BudgetProgress } from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  const [accountsResult, transactionsResult] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const accounts = accountsResult || [];
  const transactions = transactionsResult || [];

  const defaultAccount = accounts.find(
    (account) => account.isDefault
  );

  let budgetData = null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="px-5">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Dashboard Overview */}
      <Suspense fallback={<div>Loading Overview...</div>}>
        <DashboardOverview
          accounts={accounts}
          transactions={transactions}
        />
      </Suspense>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="cursor-pointer border-dashed transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col items-center justify-center pt-5 text-muted-foreground">
              <Plus className="mb-2 h-10 w-10" />
              <p className="text-sm font-medium">
                Add New Account
              </p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
          />
        ))}
      </div>
    </div>
  );
}