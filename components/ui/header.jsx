"use client";

import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  PenBox,
  Menu,
  X,
  Home,
  Sparkles,
  Workflow,
  MessageSquareQuote,
} from "lucide-react";
import { useState } from "react";

import { Button } from "./button";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3">
      <nav
        className="
          relative mx-auto max-w-[1540px]
          overflow-hidden
          border-2 border-[#6f7785]
          bg-[#101318]
          text-white
          shadow-[5px_5px_0_#18d58a]
          before:pointer-events-none
          before:absolute
          before:inset-0
          before:bg-[radial-gradient(#ffffff18_0.7px,transparent_0.7px)]
          before:bg-[size:7px_7px]
        "
      >
        {/* =====================================================
            DECORATIVE CORNERS
        ====================================================== */}

        <span className="absolute left-2 top-2 z-10 h-2 w-2 border-l border-t border-[#9ca3af]" />
        <span className="absolute right-2 top-2 z-10 h-2 w-2 border-r border-t border-[#9ca3af]" />
        <span className="absolute bottom-2 left-2 z-10 h-2 w-2 border-b border-l border-[#9ca3af]" />
        <span className="absolute bottom-2 right-2 z-10 h-2 w-2 border-b border-r border-[#9ca3af]" />

        {/* =====================================================
            MAIN NAV
        ====================================================== */}

        <div className="relative z-20 flex h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-8">

          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            aria-label="Finova Home"
            className="
              group flex shrink-0 items-center gap-2
              transition-transform duration-200
              hover:-translate-y-0.5
            "
          >
            <div className="relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
              <Image
                src="/logo2.png"
                alt="Finova"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight lg:text-2xl">
                  finova
                </span>

                <span className="h-2.5 w-2.5 rounded-full bg-[#18d58a] shadow-[0_0_10px_#18d58a]" />
              </div>

              <div className="hidden text-[9px] font-bold leading-3 tracking-widest text-[#858d9b] lg:block">
                // SMART FINANCE
                <br />
                // FOR A BRIGHTER YOU
              </div>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <div className="hidden items-center gap-1 xl:flex">
            <RetroNavLink
              href="/"
              icon={<Home size={14} />}
              active
            >
              Home
            </RetroNavLink>

            <RetroNavLink
              href="/#features"
              icon={<Sparkles size={14} />}
            >
              Features
            </RetroNavLink>

            <RetroNavLink
              href="/#how-it-works"
              icon={<Workflow size={14} />}
            >
              How It Works
            </RetroNavLink>

            <RetroNavLink
              href="/#testimonials"
              icon={<MessageSquareQuote size={14} />}
            >
              Testimonials
            </RetroNavLink>
          </div>

          {/* =================================================
              RIGHT ACTIONS
          ================================================== */}

          <div className="flex items-center gap-2 sm:gap-3">

            <Show when="signed-in">
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className="
                  group hidden items-center gap-2
                  border-2 border-white
                  bg-transparent
                  px-3 py-2
                  text-xs font-black
                  shadow-[3px_3px_0_#18d58a]
                  transition-all duration-150
                  hover:-translate-y-0.5
                  hover:bg-white
                  hover:text-[#101318]
                  active:translate-x-[2px]
                  active:translate-y-[2px]
                  active:shadow-none
                  sm:flex
                  lg:px-4
                  lg:py-2.5
                  lg:text-sm
                "
              >
                <LayoutDashboard size={17} />

                <span>Dashboard</span>
              </Link>

              {/* Add Transaction */}
              <Link
                href="/transaction/create"
                className="
                  hidden items-center gap-2
                  border-2 border-[#18d58a]
                  bg-[#18d58a]
                  px-3 py-2
                  text-xs font-black
                  text-[#101318]
                  shadow-[3px_3px_0_#ffffff]
                  transition-all duration-150
                  hover:-translate-y-0.5
                  hover:bg-[#65efb4]
                  active:translate-x-[2px]
                  active:translate-y-[2px]
                  active:shadow-none
                  sm:flex
                  lg:px-4
                  lg:py-2.5
                  lg:text-sm
                "
              >
                <PenBox size={17} />

                <span>Add Transaction</span>
              </Link>

              {/* User */}
              <div className="ml-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 sm:h-10 sm:w-10 border-2 border-white",
                    },
                  }}
                />
              </div>
            </Show>

            <Show when="signed-out">
              <SignInButton forceRedirectUrl="/dashboard">
                <button
                  className="
                    hidden
                    border-2 border-white
                    bg-white
                    px-4 py-2.5
                    text-sm font-black
                    text-[#101318]
                    shadow-[3px_3px_0_#18d58a]
                    transition-all duration-150
                    hover:-translate-y-0.5
                    hover:bg-[#18d58a]
                    active:translate-x-[2px]
                    active:translate-y-[2px]
                    active:shadow-none
                    sm:block
                  "
                >
                  Login
                </button>
              </SignInButton>
            </Show>

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              onClick={() =>
                setMobileOpen((prev) => !prev)
              }
              className="
                flex h-10 w-10
                items-center justify-center
                border-2 border-white
                bg-[#101318]
                text-white
                transition-all duration-150
                hover:border-[#18d58a]
                hover:text-[#18d58a]
                xl:hidden
              "
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <div
          className={`
            relative z-20
            border-t border-[#3b424e]
            bg-[#101318]
            transition-all duration-300
            xl:hidden
            ${
              mobileOpen
                ? "max-h-[520px] opacity-100"
                : "max-h-0 overflow-hidden opacity-0"
            }
          `}
        >
          <div className="space-y-2 p-4">

            <MobileNavLink
              href="/"
              icon={<Home size={17} />}
              onClick={closeMobileMenu}
            >
              Home
            </MobileNavLink>

            <MobileNavLink
              href="/#features"
              icon={<Sparkles size={17} />}
              onClick={closeMobileMenu}
            >
              Features
            </MobileNavLink>

            <MobileNavLink
              href="/#how-it-works"
              icon={<Workflow size={17} />}
              onClick={closeMobileMenu}
            >
              How It Works
            </MobileNavLink>

            <MobileNavLink
              href="/#testimonials"
              icon={<MessageSquareQuote size={17} />}
              onClick={closeMobileMenu}
            >
              Testimonials
            </MobileNavLink>

            <div className="my-3 border-t border-dashed border-[#454c58]" />

            <Show when="signed-in">
              <MobileNavLink
                href="/dashboard"
                icon={<LayoutDashboard size={17} />}
                onClick={closeMobileMenu}
              >
                Dashboard
              </MobileNavLink>

              <MobileNavLink
                href="/transaction/create"
                icon={<PenBox size={17} />}
                green
                onClick={closeMobileMenu}
              >
                Add Transaction
              </MobileNavLink>
            </Show>

            <Show when="signed-out">
              <SignInButton forceRedirectUrl="/dashboard">
                <button
                  onClick={closeMobileMenu}
                  className="
                    flex w-full items-center justify-center
                    border-2 border-[#18d58a]
                    bg-[#18d58a]
                    px-4 py-3
                    text-sm font-black
                    text-[#101318]
                  "
                >
                  Login →
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </nav>
    </header>
  );
};

/* ============================================================
   DESKTOP NAV LINK
============================================================ */

function RetroNavLink({
  href,
  children,
  icon,
  active = false,
}) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-1.5
        px-3 py-2
        text-xs font-bold
        transition-all duration-150
        lg:text-sm
        ${
          active
            ? "text-[#18d58a]"
            : "text-[#c5cad3] hover:text-[#18d58a]"
        }
      `}
    >
      <span
        className={`
          font-mono transition-all duration-150
          ${
            active
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }
        `}
      >
        [
      </span>

      {icon}

      <span>{children}</span>

      <span
        className={`
          font-mono transition-all duration-150
          ${
            active
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }
        `}
      >
        ]
      </span>
    </Link>
  );
}

/* ============================================================
   MOBILE NAV LINK
============================================================ */

function MobileNavLink({
  href,
  children,
  icon,
  green = false,
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3
        border-2
        px-4 py-3
        text-sm font-bold
        transition-all duration-150
        ${
          green
            ? "border-[#18d58a] bg-[#18d58a] text-[#101318]"
            : "border-[#3d444f] text-[#e5e7eb] hover:border-[#18d58a] hover:text-[#18d58a]"
        }
      `}
    >
      {icon}

      <span>{children}</span>

      <span className="ml-auto font-mono">
        →
      </span>
    </Link>
  );
}

export default Header;