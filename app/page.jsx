import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Lock,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";

import TestimonialImage from "@/components/ui/TestimonialImage";

/* ============================================================
   FINOVA LANDING PAGE
============================================================ */

export default function Home() {
  return (
    <main className="finova-paper min-h-screen overflow-hidden pt-24 text-[#172033]">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">

            {/* =================================================
                HERO LEFT
            ================================================== */}

            <div className="relative z-10">

              {/* Badge */}
              <div className="retro-badge mb-7 w-fit">
                <span className="retro-badge-dot" />
                Your money, your control
              </div>

              {/* Main Heading */}
              <h1 className="retro-heading max-w-3xl text-6xl sm:text-7xl lg:text-[6.4rem]">
                <span className="block text-[#172033]">
                  Smart Finance,
                </span>

                <span className="finova-green-text block">
                  Smarter Decisions.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-7 max-w-xl text-base leading-7 text-[#697080] sm:text-lg sm:leading-8">
                Track expenses, manage budgets, understand your
                spending and achieve your financial goals — all
                in one place.
              </p>

              {/* CTA Buttons */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="
                    retro-button
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-md
                    px-6
                    text-sm
                    font-bold
                  "
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#how-it-works"
                  className="
                    retro-button-outline
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-md
                    px-6
                    text-sm
                    font-bold
                  "
                >
                  See How It Works
                </a>
              </div>

              {/* Mini Features */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MiniFeature
                  icon={<BarChart3 size={22} />}
                  label="Track"
                  sub="Expenses"
                  className="bg-[#d8f6e8]"
                />

                <MiniFeature
                  icon={<PieChart size={22} />}
                  label="Plan"
                  sub="Budgets"
                  className="bg-[#ffd5e9]"
                />

                <MiniFeature
                  icon={<Target size={22} />}
                  label="Reach"
                  sub="Goals"
                  className="bg-[#d9eaff]"
                />

                <MiniFeature
                  icon={<Lock size={22} />}
                  label="Stay"
                  sub="Private"
                  className="bg-[#fff0b9]"
                />
              </div>
            </div>

            {/* =================================================
                HERO RIGHT — DASHBOARD PREVIEW
            ================================================== */}

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">

              {/* Back card */}
              <div
                className="
                  absolute
                  right-2
                  top-10
                  h-[88%]
                  w-[88%]
                  rotate-[6deg]
                  border-2
                  border-[#172033]
                  bg-[#bcefd9]
                  shadow-[6px_6px_0_#172033]
                "
              />

              {/* Middle card */}
              <div
                className="
                  absolute
                  right-8
                  top-5
                  h-[88%]
                  w-[88%]
                  rotate-[3deg]
                  border-2
                  border-[#172033]
                  bg-[#d9d0ff]
                  shadow-[6px_6px_0_#172033]
                "
              />

              {/* Main dashboard window */}
              <div className="retro-window relative z-10">

                {/* Browser bar */}
                <div className="retro-window-bar">
                  <span className="retro-window-dot bg-[#ff6969]" />
                  <span className="retro-window-dot bg-[#f6d35f]" />
                  <span className="retro-window-dot bg-[#55c78a]" />

                  <span className="ml-auto text-xs font-semibold text-[#697080]">
                    FINOVA / DASHBOARD
                  </span>
                </div>

                <div className="p-5 sm:p-7">

                  {/* Balance */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#697080]">
                        Total Balance
                      </p>

                      <p className="mt-1 text-3xl font-black sm:text-4xl">
                        ₹48,230
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-sm font-bold text-[#18a66a]">
                        <TrendingUp size={16} />
                        +12.5%
                      </div>
                    </div>

                    <div
                      className="
                        rounded-md
                        border-2
                        border-[#172033]
                        bg-[#fffdf8]
                        px-3
                        py-2
                        text-xs
                        font-bold
                        shadow-[2px_2px_0_#172033]
                      "
                    >
                      This Month
                    </div>
                  </div>

                  {/* Chart */}
                  <div
                    className="
                      mt-7
                      h-40
                      overflow-hidden
                      rounded-md
                      border-2
                      border-[#172033]
                      bg-[#f7f4eb]
                      p-3
                    "
                  >
                    <svg
                      viewBox="0 0 500 150"
                      className="h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="balanceGradient"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#18a66a"
                            stopOpacity="0.28"
                          />

                          <stop
                            offset="100%"
                            stopColor="#18a66a"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        d="
                          M0 125
                          L45 108
                          L80 115
                          L120 95
                          L155 104
                          L195 78
                          L230 88
                          L265 67
                          L305 74
                          L340 45
                          L375 57
                          L410 32
                          L450 44
                          L500 12
                          L500 150
                          L0 150
                          Z
                        "
                        fill="url(#balanceGradient)"
                      />

                      <polyline
                        points="
                          0,125
                          45,108
                          80,115
                          120,95
                          155,104
                          195,78
                          230,88
                          265,67
                          305,74
                          340,45
                          375,57
                          410,32
                          450,44
                          500,12
                        "
                        fill="none"
                        stroke="#18a66a"
                        strokeWidth="5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Recent Transactions */}
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-black">
                        Recent Transactions
                      </h3>

                      <Link
                        href="/dashboard"
                        className="text-xs font-bold text-[#4d73df] hover:underline"
                      >
                        View All →
                      </Link>
                    </div>

                    <div>
                      <DashboardTransaction
                        icon="☕"
                        name="Starbucks"
                        date="Sep 5, 2026"
                        amount="- ₹350"
                        negative
                        bg="bg-[#baf0d7]"
                      />

                      <DashboardTransaction
                        icon="🛒"
                        name="Amazon"
                        date="Sep 4, 2026"
                        amount="- ₹1,299"
                        negative
                        bg="bg-[#ffc9e5]"
                      />

                      <DashboardTransaction
                        icon="🚗"
                        name="Uber"
                        date="Sep 3, 2026"
                        amount="- ₹220"
                        negative
                        bg="bg-[#c6e5ff]"
                      />

                      <DashboardTransaction
                        icon="💼"
                        name="Salary"
                        date="Sep 1, 2026"
                        amount="+ ₹50,000"
                        bg="bg-[#ffe99c]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom sticker */}
              <div
                className="
                  absolute
                  -bottom-7
                  -left-5
                  z-20
                  rotate-[-4deg]
                  border-2
                  border-[#172033]
                  bg-[#d9d0ff]
                  px-4
                  py-3
                  text-sm
                  font-bold
                  shadow-[4px_4px_0_#172033]
                  sm:-left-10
                "
              >
                Make every
                <br />
                rupee count.
              </div>

              {/* Side note */}
              <div
                className="
                  absolute
                  -right-3
                  top-1/2
                  z-20
                  hidden
                  rotate-[7deg]
                  text-sm
                  font-bold
                  lg:block
                "
              >
                Better
                <br />
                money habits
                <br />
                ↘
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 flex flex-col items-center text-xs font-bold text-[#697080]">
            <span>Scroll to explore</span>
            <ArrowDown className="mt-2" size={18} />
          </div>
        </div>
      </section>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="border-y-2 border-[#172033] bg-[#fffdf8]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="
                border-r
                border-dashed
                border-[#bcb7ad]
                px-5
                py-10
                text-center
                last:border-r-0
              "
            >
              <div className="text-3xl font-black text-[#18a66a] sm:text-4xl">
                {stat.value}
              </div>

              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-[#697080] sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="scroll-mt-28 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="BUILT FOR REAL LIFE"
            title="Everything you need to make better money decisions."
            description="Finova turns everyday financial activity into a simple picture you can actually understand."
          />

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className={`retro-card hover-lift p-6 ${
                  index % 3 === 0
                    ? "bg-[#d8f6e8]"
                    : index % 3 === 1
                    ? "bg-[#e8e1ff]"
                    : "bg-[#fff1bd]"
                }`}
              >
                <div
                  className="
                    mb-7
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    border-2
                    border-[#172033]
                    bg-[#fffdf8]
                    shadow-[3px_3px_0_#172033]
                  "
                >
                  <div className="text-[#172033]">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-xl font-black">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#697080]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="
          scroll-mt-28
          border-y-2
          border-[#172033]
          bg-[#fffdf8]
          px-5
          py-20
          sm:px-8
          lg:px-10
          lg:py-28
        "
      >
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="Simple enough to use every day."
            description="No complicated spreadsheets. No financial jargon. Just a clearer view of your money."
          />

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="
                  relative
                  border-2
                  border-[#172033]
                  bg-[#faf8f2]
                  p-7
                  shadow-[6px_6px_0_#172033]
                "
              >
                {/* Number */}
                <div
                  className="
                    absolute
                    -right-3
                    -top-5
                    flex
                    h-10
                    w-10
                    rotate-3
                    items-center
                    justify-center
                    border-2
                    border-[#172033]
                    bg-[#f5d76e]
                    font-black
                    shadow-[3px_3px_0_#172033]
                  "
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className="
                    mb-6
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    border-2
                    border-[#172033]
                    bg-[#d8f6e8]
                  "
                >
                  {step.icon}
                </div>

                <h3 className="text-xl font-black">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#697080]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          TESTIMONIALS
      ====================================================== */}

      <section
        id="testimonials"
        className="scroll-mt-28 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="FROM THE COMMUNITY"
            title="Money management should feel less complicated."
            description="See what people are saying about their Finova experience."
          />

          <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="retro-card bg-[#fffdf8] p-6"
              >
                {/* User */}
                <div className="flex items-center">
                  <TestimonialImage
                    src={testimonial.image}
                    alt={testimonial.name}
                  />

                  <div className="ml-4">
                    <div className="font-black">
                      {testimonial.name}
                    </div>

                    <div className="text-xs font-medium text-[#697080]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="mt-6 text-3xl">
                  “
                </div>

                <p className="-mt-2 text-sm italic leading-7 text-[#4e5666]">
                  {testimonial.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              relative
              overflow-hidden
              border-2
              border-[#172033]
              bg-[#172033]
              px-6
              py-16
              text-center
              text-white
              shadow-[8px_8px_0_#18a66a]
              sm:px-10
              lg:py-20
            "
          >
            {/* Decorations */}
            <div className="absolute left-8 top-8 text-3xl text-[#f5d76e]">
              +
            </div>

            <div className="absolute right-10 top-12 text-4xl text-[#d9d0ff]">
              *
            </div>

            <div className="absolute bottom-7 left-1/4 text-2xl text-[#f5b5dc]">
              +
            </div>

            {/* Eyebrow */}
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9de6c5]">
              Start today
            </p>

            {/* Heading */}
            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Make every rupee count.
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#c5cad3] sm:text-base">
              Take control of your expenses, build better habits
              and make smarter financial decisions with Finova.
            </p>

            {/* CTA */}
            <Link
              href="/dashboard"
              className="
                mt-8
                inline-flex
                min-h-12
                items-center
                gap-2
                border-2
                border-[#172033]
                bg-[#f5d76e]
                px-7
                font-black
                text-[#172033]
                shadow-[4px_4px_0_#18a66a]
                transition
                hover:-translate-y-1
                hover:shadow-[6px_6px_0_#18a66a]
              "
            >
              Start Using Finova
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}
<footer className="relative overflow-hidden border-t-2 border-[#172033] bg-[#111] text-white">
  {/* Retro grid */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage:
        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  />

  {/* Decorative glow */}
  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#18a66a]/20 blur-3xl" />

  <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">

    {/* =====================================================
        FOOTER MAIN
    ====================================================== */}

    <div className="grid gap-10 md:grid-cols-[1.4fr_0.7fr_0.8fr]">

      {/* BRAND */}

      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-[#18a66a] text-2xl font-black text-black shadow-[4px_4px_0_#f5d76e]">
            f.
          </div>

          <div>
            <div className="text-xl font-black tracking-tight">
              finova<span className="text-[#18a66a]">.</span>
            </div>

            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Smart Finance
            </div>
          </div>
        </div>

        <h3 className="max-w-lg text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
          Your money.
          <br />
          <span className="text-[#18a66a]">Your rules.</span>
        </h3>

        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
          Track your spending, understand your habits and make
          smarter financial decisions — all from one place.
        </p>
      </div>

      {/* PRODUCT */}

      <div>
        <p className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d76e]">
          Product
        </p>

        <div className="space-y-4">
          <a
            href="#features"
            className="block text-sm font-bold text-zinc-400 transition-colors hover:text-white"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="block text-sm font-bold text-zinc-400 transition-colors hover:text-white"
          >
            How it works
          </a>

          <a
            href="#testimonials"
            className="block text-sm font-bold text-zinc-400 transition-colors hover:text-white"
          >
            Testimonials
          </a>

          <a
            href="/dashboard"
            className="block text-sm font-bold text-zinc-400 transition-colors hover:text-[#18a66a]"
          >
            Dashboard →
          </a>
        </div>
      </div>

      {/* PHILOSOPHY */}

      <div>
        <p className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5d76e]">
          Finova Philosophy
        </p>

        <div className="space-y-3">
          <FooterPoint text="Track every rupee" />
          <FooterPoint text="Build better habits" />
          <FooterPoint text="Spend with intention" />
        </div>
      </div>
    </div>

    {/* =====================================================
        CTA
    ====================================================== */}

    <div className="relative mt-12 overflow-hidden rounded-2xl border-2 border-white bg-[#d8f6e8] p-5 text-black shadow-[6px_6px_0_#18a66a] sm:p-7">
      
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f5d76e]/50 blur-2xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#18a66a]" />

            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Ready when you are
            </span>
          </div>

          <h4 className="text-2xl font-black tracking-tight sm:text-3xl">
            Take control of your money.
          </h4>

          <p className="mt-1 text-sm font-medium text-zinc-600">
            Start building smarter money habits today.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#18a66a] px-5 py-3 text-sm font-black uppercase shadow-[4px_4px_0_#111] transition-all hover:-translate-y-1 hover:bg-[#28c77f] hover:shadow-[6px_6px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Open Dashboard

          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>

    {/* =====================================================
        BOTTOM BAR
    ====================================================== */}

    <div className="mt-8 flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-xs font-bold text-zinc-500">
        © {new Date().getFullYear()} Finova. All rights reserved.
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-500">
          Made with
        </span>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
          💚
        </span>

        <span className="text-xs font-black text-white">
          by Harsh
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#18a66a]" />

        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Smart finance. Smarter decisions.
        </span>
      </div>
    </div>
  </div>
</footer>
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

 
 
 

 
 
 
 
 
 
 
 
    </main>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#18a66a]" />

        <span className="text-xs font-black tracking-[0.16em] text-[#697080]">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 max-w-2xl text-sm leading-7 text-[#697080] sm:text-base">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   MINI FEATURE
============================================================ */

function MiniFeature({
  icon,
  label,
  sub,
  className = "",
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`
          flex
          h-14
          w-14
          items-center
          justify-center
          border-2
          border-[#172033]
          shadow-[3px_3px_0_#172033]
          ${className}
        `}
      >
        {icon}
      </div>

      <span className="mt-3 text-xs font-black">
        {label}
      </span>

      <span className="text-xs font-bold text-[#697080]">
        {sub}
      </span>
    </div>
  );
}

/* ============================================================
   DASHBOARD TRANSACTION
============================================================ */

function DashboardTransaction({
  icon,
  name,
  date,
  amount,
  negative,
  bg,
}) {
  return (
    <div className="transaction-row gap-3">

      {/* Icon */}
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          border-2
          border-[#172033]
          text-lg
          ${bg}
        `}
      >
        {icon}
      </div>

      {/* Transaction info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">
          {name}
        </p>

        <p className="mt-0.5 text-xs text-[#697080]">
          {date}
        </p>
      </div>

      {/* Amount */}
      <p
        className={`
          whitespace-nowrap
          text-sm
          font-black
          ${
            negative
              ? "money-negative"
              : "money-positive"
          }
        `}
      >
        {amount}
      </p>
    </div>
  );
}

/* ============================================================
   FOOTER POINT
============================================================ */

function FooterPoint({ text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-black text-[#18a66a]">
        ✓
      </span>

      <span className="text-sm font-bold text-zinc-400">
        {text}
      </span>
    </div>
  );
}
