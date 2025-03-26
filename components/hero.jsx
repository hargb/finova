"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
const HeroSection = () => {
  return (
    
    <div className="pb-20 px-4">
    <div className="container mx-auto text-center">
      <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-fadeIn">Smart Finance, Smarter Decisions –  <br/>All in One Place</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fadeIn delay-200">
        
      "Take control of your money with AI-powered precision—track, analyze, and optimize your spending effortlessly while unlocking real-time financial insights for smarter, wealthier living!" 🚀💰
      </p>
      <div className="flex justify-center gap-4 mt-6 animate-fadeIn delay-400">
        <Link href="/dashboard">
        <Button size="lg" className="px-8">Get started</Button>
        </Link>

        <Link href="https://youtu.be/49rd03_GJ-c?si=TdilhVVHfF-Guji0" target="_blank" rel="noopener noreferrer" >
        <Button size="lg" variant="outline"
className="px-8">watch this</Button>
        </Link>
      </div>
      <div>
        <div className="mt-12 animate-fadeIn delay-600">
          <Image src='/Mybanner.jpeg'
          width={1280}
          height={684}
          alt="Dashboard Preview"
          className="rounded-lg shadow-2xl border mx-auto"
          priority/>
        </div>
      </div>
    </div>
    </div>
    
  )
}

export default HeroSection;
