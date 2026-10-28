import React from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeRemaining: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeRemaining < 120; // Less than 2 minutes

  return (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 sm:px-8 sm:py-3.5 ${
          isLowTime
            ? "border-red-500/35 bg-red-500/10 text-red-600"
            : "border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))] bg-[var(--ib-card)] text-[var(--ib-ink)]"
        }`}
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining ${formatTime(timeRemaining)}`}
      >
        <Clock
          size={20}
          className={isLowTime ? "text-red-500" : "text-[var(--ib-acc)]"}
          aria-hidden
        />
        <span className="font-inter text-[22px] font-bold tracking-[0.06em] tabular-nums sm:text-[24px]">
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
};
