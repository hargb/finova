"use client";

import { useEffect } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Landmark,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { updateDefaultAccount } from "@/actions/accounts";
import useFetch from "@/hooks/use-fetch";

import { Switch } from "@/components/ui/switch";

const AccountCard = ({ account }) => {
  const {
    name,
    type,
    balance,
    id,
    isDefault,
  } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updateAccount,
    error,
  } = useFetch(updateDefaultAccount);

  /* ==========================================================
     DEFAULT ACCOUNT
  ========================================================== */

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefault) {
      toast.warning(
        "You need at least one default account."
      );
      return;
    }

    await updateDefaultFn(id);
  };

  /* ==========================================================
     SUCCESS
  ========================================================== */

  useEffect(() => {
    if (updateAccount?.success) {
      toast.success(
        "Default account updated successfully"
      );
    }
  }, [updateAccount]);

  /* ==========================================================
     ERROR
  ========================================================== */

  useEffect(() => {
    if (error) {
      toast.error(
        error?.message ||
          "Failed to update default account"
      );
    }
  }, [error]);

  /* ==========================================================
     FORMATTING
  ========================================================== */

  const formattedType = type
    ? type.charAt(0) +
      type.slice(1).toLowerCase()
    : "Unknown";

  const formattedBalance = Number(
    balance || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isSavings = type === "SAVINGS";

  return (
    <div
      className={`
        group
        relative
        min-h-[220px]
        overflow-hidden
        border-2
        border-[#172033]
        bg-[#fffdf8]
        shadow-[6px_6px_0_#172033]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-[9px_9px_0_#172033]
      `}
    >
      {/* ======================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div
        className={`
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          opacity-60
          blur-[1px]
          transition-transform
          duration-500
          group-hover:scale-125
          ${
            isSavings
              ? "bg-[#d9d0ff]"
              : "bg-[#bcefd9]"
          }
        `}
      />

      <div className="absolute bottom-0 left-0 h-1 w-full bg-[#172033]" />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 flex h-full min-h-[220px] flex-col">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#c8c3b8] px-5 py-4">

          {/* Account identity */}
          <Link
            href={`/account/${id}`}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-3">

              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  border-2
                  border-[#172033]
                  shadow-[3px_3px_0_#172033]
                  transition-transform
                  duration-200
                  group-hover:rotate-3
                  ${
                    isSavings
                      ? "bg-[#d9d0ff]"
                      : "bg-[#bcefd9]"
                  }
                `}
              >
                {isSavings ? (
                  <Wallet
                    size={20}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Landmark
                    size={20}
                    strokeWidth={2.5}
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-[#172033]">
                  {name}
                </h3>

                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#697080]">
                  {formattedType} Account
                </p>
              </div>
            </div>
          </Link>

          {/* ==================================================
              DEFAULT SWITCH
          =================================================== */}

          <div
            className="flex flex-col items-end gap-1"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <span
              className={`
                text-[8px]
                font-black
                uppercase
                tracking-widest
                ${
                  isDefault
                    ? "text-[#18a66a]"
                    : "text-[#697080]"
                }
              `}
            >
              {isDefault
                ? "Default"
                : "Set Default"}
            </span>

            <div className="retro-account-switch">
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
                aria-label={`Set ${name} as default account`}
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            BALANCE
        ===================================================== */}

        <Link
          href={`/account/${id}`}
          className="flex-1 px-5 py-5"
        >
          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#697080]">
                Available Balance
              </p>

              <p className="mt-1 break-all text-3xl font-black tracking-tight text-[#172033]">
                ₹{formattedBalance}
              </p>
            </div>

            {/* Mini status */}
            <div
              className={`
                hidden
                items-center
                gap-1
                border-2
                border-[#172033]
                px-2
                py-1
                text-[9px]
                font-black
                shadow-[2px_2px_0_#172033]
                sm:flex
                ${
                  isDefault
                    ? "bg-[#d8f6e8]"
                    : "bg-[#fff0b9]"
                }
              `}
            >
              {isDefault && (
                <Check size={11} strokeWidth={3} />
              )}

              {isDefault
                ? "ACTIVE"
                : "AVAILABLE"}
            </div>
          </div>

          {/* ==================================================
              BOTTOM METRICS
          =================================================== */}

          <div className="mt-6 grid grid-cols-2 border-t-2 border-dashed border-[#c8c3b8] pt-4">

            <div className="flex items-center gap-2 border-r border-dashed border-[#c8c3b8]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8f6e8] text-[#18a66a]">
                <ArrowUpRight size={15} />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-wider text-[#697080]">
                  Income
                </p>

                <p className="text-xs font-black text-[#172033]">
                  Track
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffd5e9] text-[#e04c72]">
                <ArrowDownRight size={15} />
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-wider text-[#697080]">
                  Expense
                </p>

                <p className="text-xs font-black text-[#172033]">
                  Track
                </p>
              </div>
            </div>

          </div>
        </Link>

        {/* ====================================================
            FOOTER LABEL
        ===================================================== */}

        <div className="flex items-center justify-between bg-[#172033] px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">

          <span>
            Account ID
          </span>

          <span className="max-w-[130px] truncate text-[#9de6c5]">
            {id}
          </span>

        </div>

      </div>
    </div>
  );
};

export default AccountCard;