"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";

interface AISimulationProps {
  customQuery?: string;
  customResponse?: string;
}

const DEFAULT_QUERY =
  "How do I implement Clause 8.1 for ISO 27001 in a cloud-based SaaS environment?";

const DEFAULT_RESPONSE =
  "To implement Clause 8.1 (Operational Planning and Control) for ISO 27001 in a SaaS environment, you should focus on:\n\n1. Establishing criteria for security processes.\n2. Implementing control of the processes in accordance with the criteria.\n3. Keeping documented information to have confidence that processes have been carried out as planned.";

const AISimulation = ({ customQuery, customResponse }: AISimulationProps) => {
  const query = customQuery || DEFAULT_QUERY;
  const answer = customResponse || DEFAULT_RESPONSE;

  return (
    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] font-sans shadow-[0_24px_60px_-24px_rgba(11,18,32,0.25)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--ib-line)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--ib-card)_88%,var(--ib-accbg)),var(--ib-card))] px-3.5 py-[11px]">
        <div className="size-[9px] rounded-full bg-[#FF5F57]/90" />
        <div className="size-[9px] rounded-full bg-[#FEBC2E]/90" />
        <div className="size-[9px] rounded-full bg-[#28C840]/90" />
        <b className="ml-2.5 text-xs font-medium text-[var(--ib-mute)]">
          AI Assistant · ISO/IEC 27001
        </b>
      </div>

      <div className="min-h-[280px] space-y-4 bg-[var(--ib-card)] p-4 sm:min-h-[320px] sm:space-y-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] sm:h-8 sm:w-8">
            <Image
              src="/Icon.png"
              alt="User"
              width={14}
              height={14}
              className="sm:h-4 sm:w-4"
            />
          </div>
          <p className="max-w-[90%] rounded-[12px_12px_4px_12px] bg-[var(--ib-accbg)] p-3 text-xs font-semibold leading-relaxed text-[var(--ib-ink)] sm:p-3.5 sm:text-sm">
            {query}
          </p>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--ib-acc)_25%,var(--ib-line))] bg-[var(--ib-accbg)] sm:h-8 sm:w-8">
            <Sparkles className="h-3.5 w-3.5 text-[var(--ib-acc)] sm:h-4 sm:w-4" />
          </div>
          <p className="max-w-[90%] whitespace-pre-wrap rounded-[12px_12px_12px_4px] border border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-bg)_80%,var(--ib-card))] p-3 text-xs font-medium leading-relaxed text-[var(--ib-ink)] sm:p-3.5 sm:text-sm">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISimulation;
