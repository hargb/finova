"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Receipt,
  Wallet,
  Sparkles,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

const COLORS = [
  "#18a66a",
  "#f4c95d",
  "#ff7a59",
  "#5b8def",
  "#c77dff",
  "#ff5d8f",
  "#2ec4b6",
];

export function DashboardOverview({
  accounts = [],
  transactions = [],
}) {
  const defaultAccount =
    accounts.find((account) => account.isDefault) || accounts[0];

  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccount?.id || ""
  );

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId
  );

  const accountTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.accountId === selectedAccountId &&
        transaction.status === "COMPLETED"
    );
  }, [transactions, selectedAccountId]);

  const recentTransactions = useMemo(() => {
    return [...accountTransactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [accountTransactions]);

  const pieChartData = useMemo(() => {
    const now = new Date();

    const expensesByCategory = accountTransactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transaction.type === "EXPENSE" &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, transaction) => {
        const category = transaction.category || "Other";
        const amount = Number(transaction.amount || 0);

        acc[category] = (acc[category] || 0) + amount;

        return acc;
      }, {});

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value);
  }, [accountTransactions]);

  const totalMonthlyExpense = useMemo(() => {
    return pieChartData.reduce((sum, item) => sum + item.value, 0);
  }, [pieChartData]);

  if (accounts.length === 0) {
    return (
      <div className="overflow-hidden rounded-[24px] border-2 border-black bg-[#fffdf8] shadow-[6px_6px_0_#111]">
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-[#f4c95d] shadow-[4px_4px_0_#111]">
            <Wallet className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-black uppercase tracking-tight">
            No Accounts Yet
          </h3>

          <p className="mt-2 max-w-md text-sm font-medium text-zinc-600">
            Create an account to start tracking your finances.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      {/* ========================================================= */}
      {/* RECENT TRANSACTIONS                                      */}
      {/* ========================================================= */}

      <section className="group relative overflow-hidden rounded-[24px] border-2 border-black bg-[#fffdf8] shadow-[7px_7px_0_#111] transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_#111]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b8f2d0] opacity-60 blur-2xl" />

        <div className="relative border-b-2 border-black bg-[#111] px-5 py-4 text-white sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#18a66a]" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#18a66a]">
                  Live Feed
                </span>
              </div>

              <h2 className="text-xl font-black tracking-tight">
                Recent Transactions
              </h2>
            </div>

            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-full border-2 border-white bg-white font-bold text-black shadow-[3px_3px_0_#18a66a] sm:w-[180px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>

              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative p-5 sm:p-6">
          {selectedAccount && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-[#f2eee5] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-[#18a66a] shadow-[2px_2px_0_#111]">
                  <Wallet className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Account
                  </p>

                  <p className="truncate text-sm font-black">
                    {selectedAccount.name}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full border border-black bg-white px-3 py-1 text-[10px] font-black uppercase">
                Active
              </span>
            </div>
          )}

          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-400 bg-[#f7f5ef] px-5 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#111]">
                  <Receipt className="h-5 w-5" />
                </div>

                <p className="font-black uppercase tracking-tight">
                  No recent transactions
                </p>

                <p className="mt-1 text-xs font-medium text-zinc-500">
                  Your latest activity will appear here.
                </p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => {
                const amount = Number(transaction.amount || 0);
                const isExpense = transaction.type === "EXPENSE";

                return (
                  <div
                    key={transaction.id}
                    className="group/transaction flex items-center justify-between gap-4 rounded-2xl border-2 border-black bg-white p-3 transition-all duration-200 hover:-translate-x-1 hover:translate-y-[-2px] hover:bg-[#f7f5ef] hover:shadow-[4px_4px_0_#111]"
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0_#111]",
                          isExpense
                            ? "bg-[#ffb4a2]"
                            : "bg-[#b8f2d0]"
                        )}
                      >
                        {isExpense ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {transaction.description ||
                            "Untitled Transaction"}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {transaction.category || "Other"}
                          </span>

                          <span className="text-zinc-300">•</span>

                          <span className="text-[10px] font-bold text-zinc-500">
                            {format(
                              new Date(transaction.date),
                              "dd MMM"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "shrink-0 text-right",
                        isExpense
                          ? "text-[#d94f4f]"
                          : "text-[#138a59]"
                      )}
                    >
                      <p className="text-sm font-black sm:text-base">
                        {isExpense ? "-" : "+"}₹
                        {amount.toFixed(2)}
                      </p>

                      <p className="text-[9px] font-black uppercase tracking-wider opacity-60">
                        {isExpense ? "Expense" : "Income"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {recentTransactions.length > 0 && (
            <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#18a66a]" />
              Showing latest {recentTransactions.length} transactions
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* EXPENSE BREAKDOWN                                        */}
      {/* ========================================================= */}

      <section className="group relative overflow-hidden rounded-[24px] border-2 border-black bg-[#111] text-white shadow-[7px_7px_0_#18a66a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_#18a66a]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#18a66a] opacity-20 blur-3xl" />

        <div className="relative border-b-2 border-zinc-700 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#f4c95d]" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f4c95d]">
                  Analytics
                </span>
              </div>

              <h2 className="text-xl font-black tracking-tight">
                Monthly Expense Breakdown
              </h2>
            </div>

            <div className="hidden rounded-xl border-2 border-white/20 bg-white/5 px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                This Month
              </p>

              <p className="text-sm font-black text-[#18a66a]">
                ₹{totalMonthlyExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-6">
          {pieChartData.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-600">
                <PieChart className="h-7 w-7 text-zinc-500" />
              </div>

              <p className="font-black uppercase tracking-tight">
                No expenses this month
              </p>

              <p className="mt-1 max-w-xs text-xs font-medium text-zinc-500">
                Once you start spending, your category breakdown will
                appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="47%"
                      innerRadius={55}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#111"
                      strokeWidth={2}
                      animationBegin={100}
                      animationDuration={900}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toFixed(2)}`
                      }
                      contentStyle={{
                        backgroundColor: "#fffdf8",
                        border: "2px solid #111",
                        borderRadius: "12px",
                        color: "#111",
                        fontWeight: 800,
                        boxShadow: "4px 4px 0 #111",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={45}
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center stat */}
              <div className="pointer-events-none absolute left-1/2 top-[160px] -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Total
                </p>

                <p className="mt-1 text-lg font-black text-white">
                  ₹{totalMonthlyExpense.toFixed(0)}
                </p>
              </div>

              {/* Category summary */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {pieChartData.slice(0, 4).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 rounded-xl border border-zinc-700 bg-white/5 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[index % COLORS.length],
                        }}
                      />

                      <span className="truncate text-[10px] font-bold text-zinc-300">
                        {item.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-[10px] font-black text-white">
                      ₹{Number(item.value).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}