"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="px-4 pb-20">
      <div className="container mx-auto text-center">
        {/* Heading */}
        <h1 className="animate-fadeIn bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text pb-6 text-5xl font-bold text-transparent md:text-8xl lg:text-[105px]">
          Smart Finance, Smarter Decisions —
          <br />
          All in One Place
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl animate-fadeIn text-lg text-gray-600 [animation-delay:200ms]">
          Take control of your money with AI-powered precision—track,
          analyze, and optimize your spending effortlessly while unlocking
          real-time financial insights for smarter, wealthier living. 🚀💰
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex justify-center gap-4 animate-fadeIn [animation-delay:400ms]">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>

          <Link
            href="https://youtu.be/49rd03_GJ-c"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12 animate-fadeIn [animation-delay:600ms]">
          <Image
            src="/Mybanner.jpeg"
            width={1280}
            height={684}
            alt="Finova dashboard preview"
            className="mx-auto rounded-lg border shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;