"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { BookOpen, Bot, GraduationCap, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MasteryAnalytics } from "@/lib/analytics/track";

const ease = [0.22, 1, 0.36, 1] as const;

type ContinueYourMasteryProps = {
  /** Fire mastery_result_viewed once when mounted (result page). */
  trackResultView?: boolean;
  score?: number;
};

export default function ContinueYourMastery({
  trackResultView = false,
  score,
}: ContinueYourMasteryProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!trackResultView) return;
    MasteryAnalytics.resultViewed({
      score: typeof score === "number" ? score : undefined,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [trackResultView, score]);

  // Hardcoded production upsell URLs per Mastery Lab Developer Implementation Plan
  const cards = [
    {
      id: "academy",
      title: "ISOBrain Academy",
      description:
        "Improve your practical understanding of ISO standards through structured learning and professional training.",
      cta: "Explore ISOBrain Academy",
      href: "https://isobrain.ai/en/academy",
      icon: GraduationCap,
      iconBg: "rgba(217, 119, 6, 0.12)",
      iconColor: "#D97706",
      onClick: () => MasteryAnalytics.ctaAcademy({ score }),
    },
    {
      id: "library",
      title: "ISO Library",
      description:
        "Access a centralized knowledge resource for ISO standards, references, and implementation-related materials.",
      cta: "Explore ISO Library",
      href: "https://isobrain.ai/en/library/iso-standards",
      icon: BookOpen,
      iconBg: "var(--ib-accbg)",
      iconColor: "var(--ib-acc)",
      onClick: () => MasteryAnalytics.ctaLibrary({ score }),
    },
    {
      id: "assistant",
      title: "ISOBrain AI Assistant",
      description:
        "Get AI-powered assistance with ISO requirements, clause interpretation, implementation guidance, and compliance-related questions.",
      cta: "Try AI Assistant",
      href: "https://isobrain.ai/en/ai-assistant-home",
      icon: Bot,
      iconBg: "var(--ib-accbg)",
      iconColor: "var(--ib-acc)",
      onClick: () => MasteryAnalytics.ctaAssistant({ score }),
    },
  ];

  return (
    <section
      aria-labelledby="continue-mastery-heading"
      className="mx-auto w-full max-w-[1152px]"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8 text-center md:mb-10"
      >
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--ib-acc)]">
          Next steps
        </p>
        <h2
          id="continue-mastery-heading"
          className="mb-0! text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]"
        >
          Continue Your ISO Mastery with ISOBrain.AI
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-[14px] text-[var(--ib-mute)] sm:text-[15px]">
          Your exam result is the starting point. Use these tools to deepen
          clause knowledge, build evidence skills, and apply standards in
          practice.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
                ease,
              }}
              className="ib-card group flex h-full flex-col p-6 sm:p-7"
            >
              <div
                className="mb-5 flex size-12 items-center justify-center rounded-xl"
                style={{ background: card.iconBg }}
              >
                <Icon size={24} color={card.iconColor} aria-hidden />
              </div>
              <h3 className="mb-0! text-[18px] font-semibold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[20px]">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                {card.description}
              </p>
              <Link
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={card.onClick}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ib-acc)]/25 bg-[var(--ib-acc)] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                {card.cta}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
