"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  Landmark,
  Loader2,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import useFetch from "@/hooks/use-fetch";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0,
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const selectedType = watch("type");
  const isDefault = watch("isDefault");

  const onSubmit = async (data) => {
    await createAccountFn({
      ...data,
      name: data.name.trim(),
      balance: Number(data.balance),
    });
  };

  useEffect(() => {
    if (!newAccount?.success) return;

    toast.success("Account created successfully");

    reset();
    setOpen(false);
  }, [newAccount, reset]);

  useEffect(() => {
    if (!error) return;

    toast.error(error?.message || "Failed to create account");
  }, [error]);

  const handleDrawerChange = (value) => {
    setOpen(value);

    if (!value && !createAccountLoading) {
      reset();
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerChange}
    >
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>

      <DrawerContent className="max-h-[94vh] overflow-hidden rounded-t-[30px] border-2 border-black bg-[#f7f5ef] p-0 shadow-[0_-8px_0_#111]">
        {/* ====================================================== */}
        {/* TOP HANDLE                                             */}
        {/* ====================================================== */}

        <div className="relative flex justify-center py-3">
          <div className="h-2 w-24 rounded-full bg-zinc-300" />

          <DrawerClose
            disabled={createAccountLoading}
            className="absolute right-5 top-3 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#111] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </div>

        {/* ====================================================== */}
        {/* MAIN LAYOUT                                            */}
        {/* ====================================================== */}

        <div className="overflow-y-auto px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[26px] border-2 border-black bg-[#fffdf8] shadow-[8px_8px_0_#111] lg:grid-cols-[1.45fr_0.75fr]">
            {/* ================================================== */}
            {/* LEFT — FORM                                        */}
            {/* ================================================== */}

            <div className="p-5 sm:p-8 lg:p-10">
              {/* Header */}

              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#f4c95d] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_#111]">
                  <span className="h-2 w-2 rounded-full border border-black bg-[#18a66a]" />
                  New Account
                </div>

                <h2 className="text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-4xl lg:text-5xl">
                  Create New Account
                  <span className="text-[#18a66a]">.</span>
                </h2>

                <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-500 sm:text-base">
                  Add another account and keep your entire financial
                  world organized in one place.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* ================================================= */}
                {/* ACCOUNT NAME                                      */}
                {/* ================================================= */}

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-black text-[#172033]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#c9f5e0] shadow-[2px_2px_0_#111]">
                      <Landmark className="h-4 w-4" />
                    </span>

                    Account Name
                  </label>

                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="e.g. Main Checking, HDFC Savings"
                      disabled={createAccountLoading}
                      {...register("name")}
                      className="h-12 rounded-xl border-2 border-black bg-white px-4 pr-28 text-sm font-semibold shadow-[3px_3px_0_#111] transition-all placeholder:text-zinc-400 focus-visible:-translate-y-0.5 focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_#18a66a]"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:flex">
                      Give it a name
                      <Sparkles className="h-3 w-3 text-[#f4c95d]" />
                    </span>
                  </div>

                  {errors.name && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* ================================================= */}
                {/* TYPE + INFO                                      */}
                {/* ================================================= */}

                <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
                  <div className="space-y-2">
                    <label
                      htmlFor="type"
                      className="flex items-center gap-2 text-sm font-black text-[#172033]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#dcd5ff] shadow-[2px_2px_0_#111]">
                        <Wallet className="h-4 w-4" />
                      </span>

                      Account Type
                    </label>

                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setValue("type", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={createAccountLoading}
                    >
                      <SelectTrigger
                        id="type"
                        className="h-12 w-full rounded-xl border-2 border-black bg-white px-4 font-bold shadow-[3px_3px_0_#111] focus:ring-0"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>

                      <SelectContent className="border-2 border-black">
                        <SelectItem value="CURRENT">
                          Current
                        </SelectItem>

                        <SelectItem value="SAVINGS">
                          Savings
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {errors.type && (
                      <p className="text-xs font-bold text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* Info Card */}

                  <div className="hidden rounded-xl border-2 border-black bg-[#e7e0ff] p-4 shadow-[3px_3px_0_#111] sm:flex sm:flex-col sm:justify-center">
                    <div className="mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />

                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Quick Tip
                      </span>
                    </div>

                    <p className="text-xs font-semibold leading-5 text-zinc-700">
                      Choose the type that best matches this account.
                    </p>
                  </div>
                </div>

                {/* ================================================= */}
                {/* INITIAL BALANCE                                  */}
                {/* ================================================= */}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="balance"
                      className="flex items-center gap-2 text-sm font-black text-[#172033]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#c9f5e0] text-sm font-black shadow-[2px_2px_0_#111]">
                        ₹
                      </span>

                      Initial Balance
                    </label>

                    <span className="hidden text-[10px] font-black uppercase tracking-widest text-zinc-400 sm:block">
                      You can update this later
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      id="balance"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={createAccountLoading}
                      {...register("balance", {
                        valueAsNumber: true,
                      })}
                      className="h-12 rounded-xl border-2 border-black bg-white px-4 text-base font-bold shadow-[3px_3px_0_#111] transition-all focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_#18a66a]"
                    />
                  </div>

                  {errors.balance && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                      {errors.balance.message}
                    </p>
                  )}
                </div>

                {/* ================================================= */}
                {/* DEFAULT ACCOUNT                                  */}
                {/* ================================================= */}

                <div className="relative overflow-hidden rounded-2xl border-2 border-black bg-[#fffdf8] p-4 shadow-[4px_4px_0_#111] sm:p-5">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#f4c95d] opacity-40" />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#f4c95d] shadow-[3px_3px_0_#111]">
                        <Star className="h-5 w-5" />
                      </div>

                      <div>
                        <label
                          htmlFor="isDefault"
                          className="cursor-pointer text-sm font-black text-[#172033] sm:text-base"
                        >
                          Set as Default
                        </label>

                        <p className="mt-0.5 max-w-lg text-xs font-medium leading-5 text-zinc-500">
                          This account will be selected automatically
                          for new transactions.
                        </p>
                      </div>
                    </div>

                    <Switch
                      id="isDefault"
                      checked={isDefault}
                      disabled={createAccountLoading}
                      onCheckedChange={(checked) =>
                        setValue("isDefault", checked, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className="shrink-0 data-[state=checked]:bg-[#18a66a]"
                    />
                  </div>
                </div>

                {/* ================================================= */}
                {/* ACTION BUTTONS                                   */}
                {/* ================================================= */}

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <DrawerClose asChild>
                    <button
                      type="button"
                      disabled={createAccountLoading}
                      className="h-13 rounded-xl border-2 border-black bg-white px-5 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0_#111] transition-all hover:-translate-y-0.5 hover:bg-[#f2eee5] hover:shadow-[5px_5px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </DrawerClose>

                  <button
                    type="submit"
                    disabled={createAccountLoading}
                    className="group flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#18a66a] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[4px_4px_0_#111] transition-all hover:-translate-y-0.5 hover:bg-[#28c77f] hover:shadow-[5px_5px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createAccountLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account

                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ================================================== */}
            {/* RIGHT — FINOVA MONEY PANEL                         */}
            {/* ================================================== */}

            <div className="relative hidden overflow-hidden border-l-2 border-black bg-[#d7f6e7] lg:block">
              {/* Decorative circles */}

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#18a66a]/20 blur-3xl" />

              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#f4c95d]/30 blur-3xl" />

              <div className="relative flex h-full flex-col justify-between p-7 xl:p-9">
                {/* Top message */}

                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      Finova / 01
                    </span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white shadow-[3px_3px_0_#111]">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="relative mx-auto mb-10 max-w-[280px] rotate-[-2deg]">
                    <div className="absolute left-2 top-2 h-full w-full border-2 border-black bg-[#18a66a]" />

                    <div className="relative border-2 border-black bg-[#f4c95d] p-5 shadow-[4px_4px_0_#111]">
                      <p className="text-xl font-black uppercase leading-tight xl:text-2xl">
                        One more step
                        <br />
                        towards smarter
                        <br />
                        finances.
                      </p>
                    </div>
                  </div>

                  {/* Floating cards */}

                  <div className="relative mx-auto h-48 max-w-[300px]">
                    {/* Pink card */}

                    <div className="absolute left-7 top-12 h-28 w-52 rotate-[-7deg] rounded-2xl border-2 border-black bg-[#ff9f9f] shadow-[5px_5px_0_#111]" />

                    {/* Purple card */}

                    <div className="absolute left-12 top-5 h-28 w-52 rotate-[4deg] rounded-2xl border-2 border-black bg-[#aaa0ff] shadow-[5px_5px_0_#111]" />

                    {/* Main card */}

                    <div className="absolute left-1/2 top-0 w-60 -translate-x-1/2 rotate-[-2deg] rounded-2xl border-2 border-black bg-white p-4 shadow-[6px_6px_0_#111]">
                      <div className="mb-5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          My Account
                        </span>

                        <div className="flex">
                          <span className="h-5 w-5 rounded-full border-2 border-black bg-[#18a66a]" />
                          <span className="-ml-2 h-5 w-5 rounded-full border-2 border-black bg-[#f4c95d]" />
                        </div>
                      </div>

                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-10 items-center justify-center rounded-md border-2 border-black bg-[#f4c95d]">
                          <div className="grid grid-cols-2 gap-0.5">
                            <span className="h-1.5 w-1.5 bg-black" />
                            <span className="h-1.5 w-1.5 bg-black" />
                            <span className="h-1.5 w-1.5 bg-black" />
                            <span className="h-1.5 w-1.5 bg-black" />
                          </div>
                        </div>

                        <span className="text-xs font-black tracking-widest">
                          •••• •••• 4832
                        </span>
                      </div>

                      <div className="h-1.5 w-20 rounded-full bg-zinc-200" />
                    </div>
                  </div>
                </div>

                {/* Benefits */}

                <div className="space-y-3">
                  <Benefit text="Track income & expenses" />

                  <Benefit text="Stay on top of your financial goals" />

                  <Benefit text="Manage all your accounts in one place" />

                  <div className="flex justify-end pt-4">
                    <div className="rotate-[-6deg] text-right">
                      <p className="font-black italic leading-4">
                        Good
                        <br />
                        Money
                        <br />
                        Habits
                      </p>

                      <div className="ml-auto mt-1 h-1 w-12 rotate-[-3deg] rounded-full bg-[#18a66a]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mini panel */}

          <div className="mt-4 rounded-2xl border-2 border-black bg-[#d7f6e7] p-5 shadow-[4px_4px_0_#111] lg:hidden">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#f4c95d] shadow-[2px_2px_0_#111]">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black uppercase">
                  One more step towards smarter finances.
                </p>

                <p className="mt-1 text-xs font-medium text-zinc-600">
                  Organize your accounts and get a clearer picture of
                  your money.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <MobileBenefit text="Track spending" />
              <MobileBenefit text="Set goals" />
              <MobileBenefit text="Stay organized" />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ============================================================= */
/* BENEFIT                                                        */
/* ============================================================= */

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-3 py-3 shadow-[3px_3px_0_#111] transition-transform duration-200 hover:-translate-x-1">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#18a66a]">
        <Check className="h-4 w-4" />
      </span>

      <span className="text-xs font-black">
        {text}
      </span>
    </div>
  );
}

/* ============================================================= */
/* MOBILE BENEFIT                                                 */
/* ============================================================= */

function MobileBenefit({ text }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2">
      <Check className="h-3.5 w-3.5 text-[#18a66a]" />

      <span className="text-[10px] font-black uppercase">
        {text}
      </span>
    </div>
  );
}