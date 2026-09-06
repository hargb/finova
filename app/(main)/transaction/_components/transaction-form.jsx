"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  Repeat2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { CreateAccountDrawer } from "@/components/ui/create-account-drawer";

import { cn } from "@/lib/utils";

import {
  createTransaction,
  updateTransaction,
} from "@/actions/transaction";

import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./receipt-scanner";

export function AddTransactionForm({
  accounts = [],
  categories = [],
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),

    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount?.toString() ?? "",
            description: initialData.description ?? "",
            accountId: initialData.accountId ?? "",
            category: initialData.category ?? "",
            date: initialData.date
              ? new Date(initialData.date)
              : new Date(),
            isRecurring: initialData.isRecurring ?? false,
            recurringInterval:
              initialData.recurringInterval ?? undefined,
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId:
              accounts.find((account) => account.isDefault)?.id ?? "",
            category: "",
            date: new Date(),
            isRecurring: false,
            recurringInterval: undefined,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const accountId = watch("accountId");
  const category = watch("category");
  const recurringInterval = watch("recurringInterval");
  const amount = watch("amount");

  const filteredCategories = categories.filter(
    (categoryItem) => categoryItem.type === type
  );

  const selectedAccount = accounts.find(
    (account) => account.id === accountId
  );

  const selectedCategory = filteredCategories.find(
    (item) => item.id === category
  );

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: Number(data.amount),
    };

    if (editMode) {
      if (!editId) {
        toast.error("Transaction ID is missing");
        return;
      }

      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (!scannedData) return;

    if (scannedData.amount != null) {
      setValue("amount", String(scannedData.amount), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (scannedData.date) {
      const scannedDate = new Date(scannedData.date);

      if (!Number.isNaN(scannedDate.getTime())) {
        setValue("date", scannedDate, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }

    if (scannedData.description) {
      setValue("description", scannedData.description, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (scannedData.category) {
      setValue("category", scannedData.category, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    toast.success("Receipt scanned successfully");
  };

  useEffect(() => {
    if (!transactionResult || transactionLoading) return;

    if (transactionResult.success) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );

      reset();

      const resultAccountId = transactionResult.data?.accountId;

      if (resultAccountId) {
        router.push(`/account/${resultAccountId}`);
      } else {
        router.push("/dashboard");
      }
    } else if (transactionResult.error) {
      toast.error(transactionResult.error);
    }
  }, [
    transactionResult,
    transactionLoading,
    editMode,
    reset,
    router,
  ]);

  useEffect(() => {
    if (!isRecurring && recurringInterval) {
      setValue("recurringInterval", undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isRecurring, recurringInterval, setValue]);

  useEffect(() => {
    if (!filteredCategories.some((item) => item.id === category)) {
      setValue("category", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [type]);

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      {/* ========================================================= */}
      {/* HEADER                                                    */}
      {/* ========================================================= */}

      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#f4c95d] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]">
            <span className="h-2 w-2 rounded-full border border-black bg-[#18a66a]" />

            {editMode ? "Edit Transaction" : "New Transaction"}
          </span>

          {!editMode && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-[#18a66a]" />
              Smart Finance
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-4xl lg:text-5xl">
              {editMode ? "Edit Transaction" : "Add Transaction"}
              <span className="text-[#18a66a]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-500 sm:text-base">
              {editMode
                ? "Update the details and keep your financial records accurate."
                : "Record every rupee and keep your money story organized."}
            </p>
          </div>

          <div className="hidden rounded-xl border-2 border-black bg-[#111] px-4 py-3 text-right text-white shadow-[4px_4px_0_#18a66a] md:block">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Finova
            </p>

            <p className="text-sm font-black">
              {type === "EXPENSE" ? "Money Out" : "Money In"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CARD                                                 */}
      {/* ========================================================= */}

      <div className="overflow-hidden rounded-[26px] border-2 border-black bg-[#fffdf8] shadow-[8px_8px_0_#111]">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ===================================================== */}
          {/* RECEIPT SCANNER                                       */}
          {/* ===================================================== */}

          {!editMode && (
            <div className="border-b-2 border-black bg-[#d7f6e7] p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />

                <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                  Fast Entry
                </span>
              </div>

              <div className="rounded-2xl border-2 border-black bg-white p-3 shadow-[4px_4px_0_#111]">
                <ReceiptScanner
                  onScanComplete={handleScanComplete}
                />
              </div>
            </div>
          )}

          <div className="p-5 sm:p-7 lg:p-9">
            {/* =================================================== */}
            {/* TYPE SWITCH                                         */}
            {/* =================================================== */}

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-black uppercase tracking-wider text-[#172033]">
                  Transaction Type
                </label>

                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Step 01
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Expense */}

                <button
                  type="button"
                  disabled={transactionLoading}
                  onClick={() =>
                    setValue("type", "EXPENSE", {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={cn(
                    "group relative flex min-h-[82px] items-center gap-3 rounded-2xl border-2 border-black p-4 text-left transition-all duration-200",
                    type === "EXPENSE"
                      ? "bg-[#ffb4a2] shadow-[4px_4px_0_#111]"
                      : "bg-white shadow-[3px_3px_0_#111] hover:-translate-y-0.5 hover:bg-[#fff4f1]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black",
                      type === "EXPENSE"
                        ? "bg-white"
                        : "bg-[#ffb4a2]"
                    )}
                  >
                    <ArrowDownRight className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black uppercase">
                      Expense
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-zinc-500">
                      Money going out
                    </p>
                  </div>

                  {type === "EXPENSE" && (
                    <Check className="absolute right-3 top-3 h-4 w-4" />
                  )}
                </button>

                {/* Income */}

                <button
                  type="button"
                  disabled={transactionLoading}
                  onClick={() =>
                    setValue("type", "INCOME", {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={cn(
                    "group relative flex min-h-[82px] items-center gap-3 rounded-2xl border-2 border-black p-4 text-left transition-all duration-200",
                    type === "INCOME"
                      ? "bg-[#b8f2d0] shadow-[4px_4px_0_#111]"
                      : "bg-white shadow-[3px_3px_0_#111] hover:-translate-y-0.5 hover:bg-[#f2fff8]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black",
                      type === "INCOME"
                        ? "bg-white"
                        : "bg-[#b8f2d0]"
                    )}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black uppercase">
                      Income
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-zinc-500">
                      Money coming in
                    </p>
                  </div>

                  {type === "INCOME" && (
                    <Check className="absolute right-3 top-3 h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.type && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* =================================================== */}
            {/* AMOUNT + ACCOUNT                                    */}
            {/* =================================================== */}

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Amount */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="amount"
                    className="flex items-center gap-2 text-sm font-black text-[#172033]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#f4c95d] font-black shadow-[2px_2px_0_#111]">
                      ₹
                    </span>

                    Amount
                  </label>

                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Step 02
                  </span>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-lg font-black text-zinc-400">
                    ₹
                  </span>

                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    disabled={transactionLoading}
                    {...register("amount")}
                    className="h-16 rounded-2xl border-2 border-black bg-white pl-10 pr-4 text-xl font-black shadow-[4px_4px_0_#111] transition-all placeholder:text-zinc-300 focus-visible:-translate-y-0.5 focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-[5px_5px_0_#18a66a]"
                  />
                </div>

                {amount && Number(amount) > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#18a66a]">
                    ₹{Number(amount).toFixed(2)} recorded
                  </p>
                )}

                {errors.amount && (
                  <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Account */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-black text-[#172033]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#dcd5ff] shadow-[2px_2px_0_#111]">
                      <Wallet className="h-4 w-4" />
                    </span>

                    Account
                  </label>

                  {selectedAccount && (
                    <span className="max-w-[150px] truncate text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      {selectedAccount.name}
                    </span>
                  )}
                </div>

                <Select
                  value={accountId}
                  onValueChange={(value) =>
                    setValue("accountId", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={transactionLoading}
                >
                  <SelectTrigger className="h-16 rounded-2xl border-2 border-black bg-white px-4 font-bold shadow-[4px_4px_0_#111] focus:ring-0">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>

                  <SelectContent className="border-2 border-black">
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id}
                      >
                        {account.name} (₹
                        {Number(account.balance).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <CreateAccountDrawer>
                  <button
                    type="button"
                    disabled={transactionLoading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-400 bg-[#f7f5ef] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all hover:border-black hover:bg-[#fffdf8]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Another Account
                  </button>
                </CreateAccountDrawer>

                {errors.accountId && (
                  <p className="text-xs font-bold text-red-600">
                    {errors.accountId.message}
                  </p>
                )}
              </div>
            </div>

            {/* =================================================== */}
            {/* CATEGORY + DATE                                    */}
            {/* =================================================== */}

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {/* Category */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-[#172033]">
                    Category
                  </label>

                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Step 03
                  </span>
                </div>

                <Select
                  value={category}
                  onValueChange={(value) =>
                    setValue("category", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={transactionLoading}
                >
                  <SelectTrigger className="h-14 rounded-xl border-2 border-black bg-white px-4 font-bold shadow-[3px_3px_0_#111] focus:ring-0">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent className="border-2 border-black">
                    {filteredCategories.map((categoryItem) => (
                      <SelectItem
                        key={categoryItem.id}
                        value={categoryItem.id}
                      >
                        {categoryItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCategory && (
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-[#18a66a]" />
                    {selectedCategory.name} selected
                  </p>
                )}

                {errors.category && (
                  <p className="text-xs font-bold text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Date */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-[#172033]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#c9f5e0] shadow-[2px_2px_0_#111]">
                    <CalendarDays className="h-4 w-4" />
                  </span>

                  Date
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={transactionLoading}
                      className={cn(
                        "flex h-14 w-full items-center rounded-xl border-2 border-black bg-white px-4 text-left text-sm font-bold shadow-[3px_3px_0_#111] transition-all hover:bg-[#f7f5ef]",
                        !date && "text-zinc-400"
                      )}
                    >
                      {date ? format(date, "PPP") : "Pick a date"}

                      <ChevronDown className="ml-auto h-4 w-4" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto border-2 border-black p-0 shadow-[4px_4px_0_#111]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        if (!selectedDate) return;

                        setValue("date", selectedDate, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      disabled={(calendarDate) =>
                        calendarDate > new Date() ||
                        calendarDate < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {errors.date && (
                  <p className="text-xs font-bold text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>
            </div>

            {/* =================================================== */}
            {/* DESCRIPTION                                        */}
            {/* =================================================== */}

            <div className="mb-8 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-black text-[#172033]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#e7e0ff] shadow-[2px_2px_0_#111]">
                    <FileText className="h-4 w-4" />
                  </span>

                  Description
                </label>

                <span className="text-[10px] font-bold text-zinc-400">
                  Optional
                </span>
              </div>

              <Input
                id="description"
                placeholder="e.g. Dinner at restaurant, monthly salary..."
                disabled={transactionLoading}
                {...register("description")}
                className="h-14 rounded-xl border-2 border-black bg-white px-4 font-semibold shadow-[3px_3px_0_#111] transition-all placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_#18a66a]"
              />

              {errors.description && (
                <p className="text-xs font-bold text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* =================================================== */}
            {/* RECURRING                                          */}
            {/* =================================================== */}

            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-[#f7f5ef] p-4 shadow-[4px_4px_0_#111] sm:p-5">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f4c95d]/40" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#f4c95d] shadow-[2px_2px_0_#111]">
                      <Repeat2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        Recurring Transaction
                      </p>

                      <p className="mt-0.5 text-xs font-medium leading-5 text-zinc-500">
                        Automatically repeat this transaction on a
                        schedule.
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={isRecurring}
                    disabled={transactionLoading}
                    onCheckedChange={(checked) =>
                      setValue("isRecurring", checked, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="shrink-0 data-[state=checked]:bg-[#18a66a]"
                  />
                </div>
              </div>

              {/* Recurring interval */}

              {isRecurring && (
                <div className="mt-3 rounded-2xl border-2 border-black bg-[#d7f6e7] p-4 shadow-[3px_3px_0_#111]">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider">
                      Repeat Every
                    </label>

                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      Schedule
                    </span>
                  </div>

                  <Select
                    value={recurringInterval}
                    onValueChange={(value) =>
                      setValue("recurringInterval", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    disabled={transactionLoading}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-black bg-white font-bold shadow-[3px_3px_0_#111] focus:ring-0">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>

                    <SelectContent className="border-2 border-black">
                      <SelectItem value="DAILY">
                        Daily
                      </SelectItem>

                      <SelectItem value="WEEKLY">
                        Weekly
                      </SelectItem>

                      <SelectItem value="MONTHLY">
                        Monthly
                      </SelectItem>

                      <SelectItem value="YEARLY">
                        Yearly
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {errors.recurringInterval && (
                    <p className="mt-2 text-xs font-bold text-red-600">
                      {errors.recurringInterval.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* =================================================== */}
            {/* BOTTOM ACTIONS                                     */}
            {/* =================================================== */}

            <div className="border-t-2 border-dashed border-zinc-300 pt-6">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#18a66a]" />

                Ready to save
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={transactionLoading}
                  className="h-14 rounded-xl border-2 border-black bg-white px-5 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0_#111] transition-all hover:-translate-y-0.5 hover:bg-[#f2eee5] hover:shadow-[5px_5px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={transactionLoading}
                  className={cn(
                    "group flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-black px-5 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0_#111] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60",
                    type === "EXPENSE"
                      ? "bg-[#18a66a] hover:bg-[#28c77f]"
                      : "bg-[#f4c95d] hover:bg-[#ffda72]"
                  )}
                >
                  {transactionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {editMode
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editMode
                        ? "Update Transaction"
                        : "Create Transaction"}

                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* FOOTER NOTE                                               */}
      {/* ========================================================= */}

      <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-[#18a66a]" />
        Every transaction tells your money story
        <span className="h-1.5 w-1.5 rounded-full bg-[#f4c95d]" />
      </div>
    </div>
  );
}