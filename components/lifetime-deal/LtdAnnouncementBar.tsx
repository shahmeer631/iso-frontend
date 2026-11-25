"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import UtcCountdown from "./UtcCountdown";
import type { PublicPromotionStatus } from "@/lib/lifetimeDeal/types";

const ease = [0.22, 1, 0.36, 1] as const;

type LtdAnnouncementBarProps = {
  promotion: PublicPromotionStatus;
  onExpired?: () => void;
};

const LtdAnnouncementBar = ({
  promotion,
  onExpired,
}: LtdAnnouncementBarProps) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="relative mx-auto mb-8 mt-2 w-full max-w-4xl px-4 sm:mb-12"
    >
      <div
        className="overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-[0_16px_40px_-28px_rgba(11,18,32,0.3)] sm:rounded-3xl"
        role="region"
        aria-label={t("ltd.announcementAria", "Lifetime deal announcement")}
      >
        <div className="border-b border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-ink)_92%,transparent)] px-4 py-3 text-center sm:px-6 sm:py-3.5">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-white sm:text-[13px]">
            {t(
              "ltd.announcementBar",
              "7-DAY LIFETIME ACCESS EVENT: Pay once, use ISOBrain.AI forever.",
            )}
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/70 sm:text-[12px]">
            {t(
              "ltd.announcementSub",
              "Subscriptions return when the timer hits zero.",
            )}
          </p>
        </div>

        <div className="relative px-4 py-6 sm:px-8 sm:py-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--ib-acc)_50%,transparent)] to-transparent"
          />

          <div className="mb-5 flex flex-col items-center text-center">
            <div className="ib-eye mb-2 inline-flex items-center gap-2">
              <Clock className="size-3.5" aria-hidden />
              {t(
                "ltd.countdownEyebrow",
                "Limited-Time Offer · Subscriptions Return When Timer Hits Zero",
              )}
            </div>
            <h2 className="mb-0! text-[18px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[22px]">
              {t("ltd.countdownHeading", "7-Day Lifetime Access Deal Ends In:")}
            </h2>
          </div>

          <UtcCountdown
            endsAt={promotion.endsAt}
            serverTime={promotion.serverTime}
            onExpired={onExpired}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LtdAnnouncementBar;
