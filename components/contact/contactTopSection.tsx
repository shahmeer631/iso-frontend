"use client";

import { FC } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const GetInTouchWithForm: FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const fade = (delay = 0) =>
    reduceMotion
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease },
        };

  const heading = t("contact.heading");
  const accentMatch = heading.match(/^(.*?)(Touch|touch)(.*)$/);

  return (
    <header className="relative overflow-x-clip border-b border-[var(--ib-line)] bg-[var(--ib-bg)] pt-[88px] pb-12 sm:pb-14 lg:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_15%,transparent),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_12s_ease-in-out_infinite_alternate]" />
        <div
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 65% 55% at 50% 28%, black 12%, transparent 72%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--ib-bg)] to-transparent" />
      </div>

      <div className="ib-w relative z-[1]">
        <div className="mx-auto max-w-[680px] text-center">
          <motion.span
            {...fade(0)}
            className="ib-pill mx-auto border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] shadow-[0_1px_0_color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
          >
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            {t("contact.badge")}
          </motion.span>

          <motion.h1
            {...fade(0.08)}
            className="mt-6 mb-0! text-[36px] font-bold leading-[1.08] tracking-[-0.038em] sm:text-[48px] lg:text-[54px]"
          >
            {accentMatch ? (
              <>
                {accentMatch[1]}
                <span className="bg-[linear-gradient(105deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_50%,var(--ib-ink))_50%,var(--ib-ink)_100%)] bg-clip-text text-transparent">
                  {accentMatch[2]}
                </span>
                {accentMatch[3]}
              </>
            ) : (
              heading
            )}
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mx-auto mt-5 max-w-[620px] text-[16px] leading-[1.7] text-[var(--ib-mute)] sm:text-[17px] lg:text-lg"
          >
            {t("contact.subtitle") ||
              "Tell us what you need—product guidance, enterprise onboarding, Academy access, or AI Assistant support. We respond to most messages within one business day."}
          </motion.p>
          <motion.p
            {...fade(0.22)}
            className="mx-auto mt-4 max-w-[560px] text-[14px] font-medium leading-relaxed text-[var(--ib-ink)]/80"
          >
            Prefer a direct line? Email{" "}
            <a
              href="mailto:support@isobrain.ai"
              className="font-semibold text-[var(--ib-acc)] underline-offset-2 hover:underline"
            >
              support@isobrain.ai
            </a>{" "}
            or use the form below with as much context as you can share.
          </motion.p>
        </div>
      </div>
    </header>
  );
};

export default GetInTouchWithForm;
