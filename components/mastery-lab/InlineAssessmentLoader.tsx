"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface InlineAssessmentLoaderProps {
  title: string;
  description: string;
  steps: string[];
}

/** Section-scoped loader — does not cover the page or blur the site chrome. */
const InlineAssessmentLoader: React.FC<InlineAssessmentLoaderProps> = ({
  title,
  description,
  steps,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="ib-card relative mt-5 overflow-hidden p-5 sm:mt-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[var(--ib-accbg)] blur-2xl"
      />

      <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--ib-acc)_25%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
          <Loader2 className="size-6 animate-spin" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-0! text-[16px] font-bold tracking-tight text-[var(--ib-ink)] sm:text-[18px]">
            {title}
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[14.5px]">
            {description}
          </p>

          <ul className="mt-5 space-y-2.5">
            {steps.map((step, i) => (
              <motion.li
                key={`${step}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.12, duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-3.5 py-2.5"
              >
                <span
                  className="size-2 shrink-0 rounded-full bg-[var(--ib-acc)]"
                  style={{
                    animation: `pulse 1.4s ease-in-out ${i * 0.25}s infinite`,
                  }}
                  aria-hidden
                />
                <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--ib-mute)] sm:text-[12px]">
                  {step}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InlineAssessmentLoader;
