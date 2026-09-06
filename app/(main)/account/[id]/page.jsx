import { Suspense } from "react";
import { notFound } from "next/navigation";
import BarLoader from "react-spinners/BarLoader";

import { getAccountWithTransactions } from "@/actions/accounts";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";

const AccountPage = async ({ params }) => {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const transactions = accountData.transactions ?? [];

  const transactionCount =
    accountData._count?.transactions ?? transactions.length;

  return (
    <div className="space-y-8 px-5">
      {/* Account Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="gradient-title text-5xl font-bold capitalize sm:text-6xl">
            {accountData.name}
          </h1>

          <p className="text-muted-foreground">
            {accountData.type
              ? `${accountData.type.charAt(0)}${accountData.type
                  .slice(1)
                  .toLowerCase()} Account`
              : "Unknown Account"}
          </p>
        </div>

        <div className="pb-2 text-right">
          <div className="text-xl font-bold sm:text-2xl">
            ₹{Number(accountData.balance).toFixed(2)}
          </div>

          <p className="text-sm text-muted-foreground">
            {transactionCount} Transactions
          </p>
        </div>
      </div>

      {/* Chart */}
      <Suspense
        fallback={
          <BarLoader
            className="mt-4"
            width="100%"
            color="#9333ea"
          />
        }
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions */}
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default AccountPage;