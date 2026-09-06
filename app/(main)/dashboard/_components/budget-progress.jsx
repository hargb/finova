"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Pencil,
  PiggyBank,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import useFetch from "@/hooks/use-fetch";
import { updateBudget } from "@/actions/budget";

/* ============================================================
   BUDGET PROGRESS
============================================================ */

export function BudgetProgress({
  initialBudget,
  currentExpenses = 0,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  /* ==========================================================
     CALCULATIONS
  ========================================================== */

  const budgetAmount = Number(
    initialBudget?.amount || 0
  );

  const expenses = Number(
    currentExpenses || 0
  );

  const percentUsed =
    budgetAmount > 0
      ? (expenses / budgetAmount) * 100
      : 0;

  const progressValue = Math.min(
    Math.max(percentUsed, 0),
    100
  );

  const roundedPercent = Math.round(
    percentUsed
  );

  const remaining = Math.max(
    budgetAmount - expenses,
    0
  );

  const exceeded =
    percentUsed > 100;

  const danger =
    percentUsed >= 90;

  const warning =
    percentUsed >= 75 &&
    percentUsed < 90;

  /* ==========================================================
     STATUS
  ========================================================== */

  let statusText = "You're doing great.";

  if (exceeded) {
    statusText = "Budget exceeded. Time to slow down.";
  } else if (danger) {
    statusText = "Careful. You're almost at your limit.";
  } else if (warning) {
    statusText = "You're getting close to your limit.";
  }

  /* ==========================================================
     UPDATE BUDGET
  ========================================================== */

  const handleUpdateBudget = async () => {
    const amount = Number(newBudget);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Please enter a valid budget amount."
      );
      return;
    }

    await updateBudgetFn(amount);
  };

  /* ==========================================================
     CANCEL
  ========================================================== */

  const handleCancel = () => {
    setNewBudget(
      initialBudget?.amount?.toString() || ""
    );

    setIsEditing(false);
  };

  /* ==========================================================
     SUCCESS
  ========================================================== */

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);

      setNewBudget(
        updatedBudget.data?.amount?.toString() ||
          newBudget
      );

      toast.success(
        "Budget updated successfully."
      );
    }
  }, [updatedBudget]);

  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
    if (error) {
      toast.error(
        error?.message ||
          "Failed to update budget."
      );
    }
  }, [error]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="budget-retro-wrapper">

      {/* ====================================================
          TOP HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        {/* LEFT */}
        <div className="flex items-start gap-4">

          {/* Icon */}
          <div
            className={`
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              border-2
              border-[#172033]
              shadow-[3px_3px_0_#172033]
              ${
                exceeded
                  ? "bg-[#ffd5e9]"
                  : danger
                  ? "bg-[#ffc9c9]"
                  : warning
                  ? "bg-[#fff0b9]"
                  : "bg-[#d8f6e8]"
              }
            `}
          >
            {exceeded || danger ? (
              <AlertTriangle
                size={25}
                strokeWidth={2.5}
              />
            ) : (
              <PiggyBank
                size={25}
                strokeWidth={2.5}
              />
            )}
          </div>

          {/* Heading */}
          <div>
            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-xl font-black text-[#172033]">
                Monthly Budget
              </h3>

              <span className="budget-retro-tag">
                DEFAULT
              </span>
            </div>

            <p className="mt-1 text-xs font-medium text-[#697080]">
              {initialBudget
                ? "Your spending command center"
                : "No budget has been created yet"}
            </p>
          </div>
        </div>

        {/* ==================================================
            EDIT AREA
        =================================================== */}

        {initialBudget && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="
              group
              flex
              items-center
              justify-center
              gap-2
              border-2
              border-[#172033]
              bg-[#fffdf8]
              px-4
              py-2
              text-xs
              font-black
              shadow-[3px_3px_0_#172033]
              transition-all
              duration-150
              hover:-translate-y-0.5
              hover:bg-[#f5d76e]
              active:translate-x-[2px]
              active:translate-y-[2px]
              active:shadow-none
            "
          >
            <Pencil
              size={14}
              className="transition-transform group-hover:rotate-[-8deg]"
            />

            EDIT BUDGET
          </button>
        )}
      </div>

      {/* ====================================================
          EDIT MODE
      ===================================================== */}

      {isEditing && (
        <div className="mt-6 border-2 border-[#172033] bg-[#f7f4eb] p-4 shadow-[4px_4px_0_#172033]">

          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-[#697080]">
            Set your monthly limit
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-[#697080]">
                ₹
              </span>

              <Input
                type="number"
                min="1"
                step="0.01"
                value={newBudget}
                onChange={(event) =>
                  setNewBudget(
                    event.target.value
                  )
                }
                className="
                  h-11
                  rounded-none
                  border-2
                  border-[#172033]
                  bg-[#fffdf8]
                  pl-8
                  font-black
                  text-[#172033]
                  shadow-[2px_2px_0_#172033]
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                "
                placeholder="Enter budget amount"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <Button
              type="button"
              onClick={handleUpdateBudget}
              disabled={isLoading}
              className="
                h-11
                rounded-none
                border-2
                border-[#172033]
                bg-[#18a66a]
                px-5
                font-black
                text-[#172033]
                shadow-[3px_3px_0_#172033]
                hover:bg-[#43d58e]
                disabled:opacity-60
              "
            >
              <Check
                className="mr-2 h-4 w-4"
                strokeWidth={3}
              />

              {isLoading
                ? "SAVING..."
                : "SAVE"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="
                h-11
                rounded-none
                border-2
                border-[#172033]
                bg-[#ffd5e9]
                px-5
                font-black
                text-[#172033]
                shadow-[3px_3px_0_#172033]
                hover:bg-[#ffbfdc]
              "
            >
              <X
                className="mr-2 h-4 w-4"
                strokeWidth={3}
              />

              CANCEL
            </Button>
          </div>
        </div>
      )}

      {/* ====================================================
          NO BUDGET
      ===================================================== */}

      {!initialBudget && !isEditing && (
        <div className="mt-6 border-2 border-dashed border-[#172033] bg-[#fff0b9] p-6 text-center">

          <PiggyBank
            className="mx-auto mb-3"
            size={30}
          />

          <p className="font-black text-[#172033]">
            No monthly budget yet.
          </p>

          <p className="mt-1 text-xs text-[#697080]">
            Set one to start tracking your spending.
          </p>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="
              mt-4
              border-2
              border-[#172033]
              bg-[#172033]
              px-5
              py-2.5
              text-xs
              font-black
              text-white
              shadow-[3px_3px_0_#18a66a]
              transition-all
              hover:-translate-y-0.5
            "
          >
            CREATE BUDGET →
          </button>
        </div>
      )}

      {/* ====================================================
          BUDGET DATA
      ===================================================== */}

      {initialBudget &&
        budgetAmount > 0 &&
        !isEditing && (
          <div className="mt-7">

            {/* Amounts */}
            <div className="grid gap-5 sm:grid-cols-3">

              {/* Spent */}
              <BudgetStat
                label="Spent"
                value={`₹${expenses.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`}
                className={
                  exceeded
                    ? "bg-[#ffd5e9]"
                    : "bg-[#f7f4eb]"
                }
              />

              {/* Budget */}
              <BudgetStat
                label="Budget"
                value={`₹${budgetAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`}
                className="bg-[#d9eaff]"
              />

              {/* Remaining */}
              <BudgetStat
                label={
                  exceeded
                    ? "Over Budget"
                    : "Remaining"
                }
                value={
                  exceeded
                    ? `₹${(
                        expenses -
                        budgetAmount
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : `₹${remaining.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                }
                className={
                  exceeded
                    ? "bg-[#ffc9c9]"
                    : "bg-[#d8f6e8]"
                }
              />
            </div>

            {/* ==================================================
                PROGRESS
            =================================================== */}

            <div className="mt-7">

              <div className="mb-3 flex items-end justify-between gap-4">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#697080]">
                    Budget used
                  </p>

                  <p
                    className={`
                      mt-1
                      text-3xl
                      font-black
                      ${
                        exceeded
                          ? "text-[#d34b70]"
                          : danger
                          ? "text-[#d34b70]"
                          : warning
                          ? "text-[#b98500]"
                          : "text-[#18a66a]"
                      }
                    `}
                  >
                    {percentUsed.toFixed(1)}%
                  </p>
                </div>

                <p className="text-right text-xs font-bold text-[#697080]">
                  {statusText}
                </p>
              </div>

              {/* Retro progress bar */}
              <div className="relative h-7 border-2 border-[#172033] bg-[#e7e3da] p-1 shadow-[3px_3px_0_#172033]">

                <div
                  className={`
                    h-full
                    transition-all
                    duration-700
                    ease-out
                    ${
                      exceeded
                        ? "bg-[#e45b7d]"
                        : danger
                        ? "bg-[#e45b7d]"
                        : warning
                        ? "bg-[#f0c94f]"
                        : "bg-[#18a66a]"
                    }
                  `}
                  style={{
                    width: `${progressValue}%`,
                  }}
                />

                {/* Tick marks */}
                <div className="pointer-events-none absolute inset-0 flex justify-between px-[24%]">
                  <span className="h-full border-l-2 border-dashed border-[#172033]/25" />
                  <span className="h-full border-l-2 border-dashed border-[#172033]/25" />
                  <span className="h-full border-l-2 border-dashed border-[#172033]/25" />
                </div>
              </div>

              {/* Scale */}
              <div className="mt-2 flex justify-between text-[9px] font-black uppercase tracking-wider text-[#697080]">
                <span>₹0</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Status message */}
            <div
              className={`
                mt-6
                flex
                items-center
                gap-3
                border-2
                border-[#172033]
                px-4
                py-3
                text-xs
                font-bold
                shadow-[3px_3px_0_#172033]
                ${
                  exceeded
                    ? "bg-[#ffd5e9]"
                    : danger
                    ? "bg-[#ffc9c9]"
                    : warning
                    ? "bg-[#fff0b9]"
                    : "bg-[#d8f6e8]"
                }
              `}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-[#172033] bg-[#fffdf8]">
                {exceeded || danger ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Check size={14} />
                )}
              </span>

              <span>
                {statusText}
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

/* ============================================================
   BUDGET STAT
============================================================ */

function BudgetStat({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`
        border-2
        border-[#172033]
        p-4
        shadow-[3px_3px_0_#172033]
        ${className}
      `}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#697080]">
        {label}
      </p>

      <p className="mt-1 break-all text-xl font-black text-[#172033] sm:text-2xl">
        {value}
      </p>
    </div>
  );
}