"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FullPageLoaderProps {
  isLoading: boolean;
  title: string;
  description: string;
  steps: string[];
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  isLoading,
  title,
  description,
  steps,
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] h-screen flex items-center justify-center p-4"
          style={{
            background: "rgba(15, 17, 26, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col items-center gap-8 px-6 text-center max-w-lg w-full">
            {/* Animated Rings */}
            <div className="relative flex items-center mb-10 justify-center">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "#00F0FF",
                  borderRightColor: "rgba(0,240,255,0.3)",
                }}
              />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "#B026FF",
                  borderLeftColor: "rgba(176,38,255,0.3)",
                }}
              />
              {/* Center pulse */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center"
                style={{
                  background: "rgba(0,240,255,0.1)",
                  borderColor: "rgba(0,240,255,0.4)"
                }}
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  style={{ color: "#00F0FF" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-grotesk text-xl md:text-3xl font-bold text-white tracking-tight"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-sm md:text-base text-[#A0AAB2] max-w-sm mx-auto leading-relaxed"
              >
                {description}
              </motion.p>
            </div>

            {/* Animated step indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 w-full max-w-[320px]"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.4 }}
                  className="flex items-center gap-4 bg-[#1E212B] border border-[#333333] rounded-xl px-5 py-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: "#00F0FF" }}
                  />
                  <span className="font-inter text-xs md:text-sm text-[#A0AAB2] font-semibold whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-wider">
                    {step}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullPageLoader;
