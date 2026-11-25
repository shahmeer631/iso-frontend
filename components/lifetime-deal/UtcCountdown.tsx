"use client";

import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useUtcCountdown } from "@/hooks/useUtcCountdown";
import { pad2 } from "@/lib/lifetimeDeal/countdown";

type UtcCountdownProps = {
  endsAt: string | null | undefined;
  serverTime?: string | null;
  className?: string;
  compact?: boolean;
  onExpired?: () => void;
};

/**
 * Accessible days/hours/minutes/seconds countdown for a shared UTC deadline.
 */
const UtcCountdown = ({
  endsAt,
  serverTime,
  className = "",
  compact = false,
  onExpired,
}: UtcCountdownProps) => {
  const { t } = useTranslation();
  const parts = useUtcCountdown(endsAt, serverTime);
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    if (parts.expired && !expiredRef.current) {
      expiredRef.current = true;
      onExpired?.();
    }
    if (!parts.expired) expiredRef.current = false;
  }, [parts.expired, onExpired]);

  const units = [
    { label: t("ltd.days", "Days"), value: parts.days },
    { label: t("ltd.hours", "Hours"), value: parts.hours },
    { label: t("ltd.mins", "Mins"), value: parts.minutes },
    {
      label: t("ltd.secs", "Secs"),
      value: parts.seconds,
      isAccent: true,
    },
  ];

  const liveLabel = parts.expired
    ? t("ltd.offerEndedShort", "Offer ended")
    : t("ltd.countdownAria", {
        defaultValue:
          "Lifetime offer ends in {{days}} days, {{hours}} hours, {{minutes}} minutes, {{seconds}} seconds",
        days: parts.days,
        hours: parts.hours,
        minutes: parts.minutes,
        seconds: parts.seconds,
      });

  return (
    <div
      className={className}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={liveLabel}
    >
      {parts.expired ? (
        <p className="text-center text-[14px] font-semibold text-[var(--ib-mute)] sm:text-[15px]">
          {t(
            "ltd.offerEnded",
            "The 7-Day Lifetime Access Offer Has Ended. Standard Subscription Plans Apply.",
          )}
        </p>
      ) : (
        <div
          className={`flex items-center justify-center ${
            compact ? "gap-2 sm:gap-3" : "gap-2.5 sm:gap-4 lg:gap-5"
          }`}
        >
          {units.map((unit, index) => (
            <Fragment key={unit.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center font-bold tabular-nums transition-colors ${
                    compact
                      ? "size-11 rounded-lg text-lg sm:size-12 sm:text-xl"
                      : "size-14 rounded-xl text-2xl sm:size-16 sm:rounded-2xl sm:text-3xl lg:size-20 lg:text-4xl"
                  } ${
                    unit.isAccent
                      ? "border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                      : "border border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)]"
                  }`}
                >
                  {pad2(unit.value)}
                </div>
                <span
                  className={`mt-1.5 font-semibold uppercase tracking-widest sm:mt-2 ${
                    compact ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px] lg:text-xs"
                  } ${unit.isAccent ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"}`}
                >
                  {unit.label}
                </span>
              </div>
              {index < units.length - 1 ? (
                <span
                  className={`mb-4 font-bold text-[var(--ib-mute)] sm:mb-5 ${
                    compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl lg:text-3xl"
                  }`}
                  aria-hidden
                >
                  :
                </span>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default UtcCountdown;
