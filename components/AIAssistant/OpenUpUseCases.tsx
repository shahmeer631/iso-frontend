// components/OpenUpUseCases.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // shadcn button

const OpenUpUseCases = () => {
  return (
    <div className=" md:max-w-2xl mx-auto flex items-center justify-center px-4 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Small heading */}
        <h2 className="text-brand-cyan text-sm md:text-base font-medium tracking-wide uppercase">
          OpenUp Use Cases
        </h2>

        {/* Main headline - gradient text */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight bg-black bg-clip-text text-transparent">
          Generate Blog, Article or Essay Ideas in One Click
        </h1>

        {/* Description */}
        <p className="text-sm md:text-lg text-gray-400 mx-auto leading-relaxed">
          The easiest way to come up with catchy blog, essay, and article topics and content structures using AI writing assistant.
        </p>

        {/* CTA Button */}
        <div className="-pt-4">
          <Button
            size="lg"
            className="bg-brand-cyan text-[#0F111A] hover:bg-[#2b2bf4] text-white text-lg px-10 py-7 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Writing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenUpUseCases;