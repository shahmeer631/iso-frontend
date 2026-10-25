"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const OfferTimer = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const [mounted, setMounted] = useState(false);

  const TOTAL_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    setMounted(true);

    const storedEndTime = localStorage.getItem("offerEndTime");
    let endTime: number;

    if (storedEndTime && !isNaN(Number(storedEndTime))) {
      endTime = Number(storedEndTime);
      if (endTime <= Date.now()) {
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
      }
    } else {
      endTime = Date.now() + TOTAL_MS;
      localStorage.setItem("offerEndTime", endTime.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      let distance = endTime - now;

      if (distance <= 0) {
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
        distance = TOTAL_MS;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="relative mx-auto mb-10 mt-2 w-full max-w-4xl px-4 sm:mb-14"
    >
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <div className="ib-eye mx-auto mb-3 inline-flex items-center gap-2">
          <Clock className="size-3.5" aria-hidden />
          {t("pricingPage.offerSub")}
        </div>
        <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[28px]">
          {t("pricingPage.offerHeading")}
        </h2>
      </div>

      <div className="relative mx-auto flex w-fit items-center justify-center overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-6 py-5 shadow-[0_16px_40px_-28px_rgba(11,18,32,0.3)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] sm:rounded-3xl sm:px-12 sm:py-7 lg:px-16">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--ib-acc)_50%,transparent)] to-transparent"
        />

        <div className="relative z-[1] flex items-center gap-3 sm:gap-4 lg:gap-5">
          {[
            { label: t("pricingPage.hours"), value: timeLeft.hours },
            { label: t("pricingPage.mins"), value: timeLeft.minutes },
            {
              label: t("pricingPage.secs"),
              value: timeLeft.seconds,
              isAccent: true,
            },
          ].map((time, index) => (
            <Fragment key={time.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-14 items-center justify-center rounded-xl text-2xl font-bold transition-transform duration-300 sm:size-16 sm:rounded-2xl sm:text-3xl lg:size-20 lg:text-4xl ${
                    time.isAccent
                      ? "border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                      : "border border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)]"
                  }`}
                >
                  {time.value.toString().padStart(2, "0")}
                </div>
                <span
                  className={`mt-2 text-[9px] font-semibold uppercase tracking-widest sm:mt-3 sm:text-[10px] lg:text-xs ${
                    time.isAccent ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"
                  }`}
                >
                  {time.label}
                </span>
              </div>
              {index < 2 && (
                <span className="mb-5 text-xl font-bold text-[var(--ib-mute)] sm:mb-6 sm:text-2xl lg:text-3xl">
                  :
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OfferTimer;
