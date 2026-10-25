"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import Image from "next/image";

const USER_PROMPT = "What does clause 6.1.2 expect an auditor to see?";

const RESPONSE_PARTS = [
  {
    text: "Clause 6.1.2 expects a documented risk assessment process with defined criteria, consistent results and named risk owners.",
    cite: "6.1.2",
  },
  {
    text: "Typical evidence includes the risk register, approved criteria and records of how risks were analysed.",
    cite: "6.1.2 c–d",
  },
] as const;

const RELATED = [
  { t: "Clause 6.1.2", d: "Risk assessment" },
  { t: "Clause 8.2", d: "Operation" },
  { t: "Annex A 5.1", d: "Policies" },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Premium homepage hero AI Assistant showcase.
 * Frontend demo only — not connected to live AI.
 */
export default function HeroAIPreview() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"prompt" | "typing" | "answer">(
    reduceMotion ? "answer" : "prompt"
  );

  useEffect(() => {
    if (reduceMotion) {
      setPhase("answer");
      return;
    }

    setPhase("prompt");
    const t1 = window.setTimeout(() => setPhase("typing"), 700);
    const t2 = window.setTimeout(() => setPhase("answer"), 2100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduceMotion]);

  const showAnswer = phase === "answer";
  const showTyping = phase === "typing";

  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-4 sm:pb-6 lg:max-w-none lg:pb-2">
      {/* Soft ambient glow behind the card stack */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[36px] bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--ib-acc)_22%,transparent),transparent_58%),radial-gradient(ellipse_at_85%_75%,color-mix(in_srgb,var(--ib-acc)_12%,transparent),transparent_52%)] motion-safe:animate-[hero-glow_10s_ease-in-out_infinite_alternate]"
      />

      {/* Decorative neural nodes */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-2 top-6 z-0 hidden h-[150px] w-[150px] text-[var(--ib-acc)] opacity-[0.16] sm:block motion-safe:animate-[hero-float_7s_ease-in-out_infinite]"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="24" cy="28" r="3.5" fill="currentColor" />
        <circle cx="72" cy="18" r="2.5" fill="currentColor" />
        <circle cx="96" cy="52" r="3" fill="currentColor" />
        <circle cx="58" cy="68" r="4" fill="currentColor" />
        <circle cx="28" cy="88" r="2.5" fill="currentColor" />
        <circle cx="88" cy="96" r="3" fill="currentColor" />
        <path
          d="M24 28L72 18L96 52L58 68L24 28M58 68L28 88M96 52L88 96L58 68"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.7"
        />
      </svg>

      {/* Depth plate behind main card */}
      <div
        aria-hidden
        className="absolute inset-x-3 top-4 bottom-2 -z-[1] hidden rounded-[18px] border border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] opacity-70 sm:block motion-safe:translate-x-2 motion-safe:translate-y-2"
      />

      <motion.div
        initial={
          reduceMotion ? false : { opacity: 0, y: 22, scale: 0.97 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease, delay: reduceMotion ? 0 : 0.12 }}
        className="ib-card relative z-[1] overflow-hidden shadow-[0_28px_64px_-28px_rgba(11,18,32,0.32),0_0_0_1px_color-mix(in_srgb,var(--ib-acc)_8%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--ib-acc)_10%,transparent)]"
      >
        {/* Title bar */}
        <div className="flex items-center gap-1.5 border-b border-[var(--ib-line)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--ib-card)_88%,var(--ib-accbg)),var(--ib-card))] px-3.5 py-[11px]">
          <i className="block size-[9px] rounded-full bg-[#FF5F57]/90" />
          <i className="block size-[9px] rounded-full bg-[#FEBC2E]/90" />
          <i className="block size-[9px] rounded-full bg-[#28C840]/90" />
          <div className="ml-2.5 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-[var(--ib-ok)] opacity-60 motion-safe:animate-ping" />
              <span className="relative size-2 rounded-full bg-[var(--ib-ok)]" />
            </span>
            <b className="text-xs font-medium text-[var(--ib-mute)]">
              AI Assistant · ISO/IEC 27001
            </b>
          </div>
          <span className="ml-auto hidden rounded-full bg-[var(--ib-accbg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ib-acc)] sm:inline">
            Live demo
          </span>
        </div>

        <div className="relative p-[18px] sm:p-[22px]">
          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.32]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
            }}
          />

          <div className="relative space-y-3.5">
            {/* User prompt */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease }}
              className="ml-auto flex max-w-[92%] items-start gap-2.5 sm:max-w-[86%]"
            >
              <p className="rounded-[14px_14px_4px_14px] border border-[color-mix(in_srgb,var(--ib-acc)_14%,var(--ib-line))] bg-[var(--ib-accbg)] px-3.5 py-2.5 text-sm font-medium leading-relaxed text-[var(--ib-ink)] shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                {USER_PROMPT}
              </p>
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-sm">
                <span className="text-[10px] font-bold text-[var(--ib-acc)]">
                  You
                </span>
              </div>
            </motion.div>

            {/* AI row */}
            <div className="flex items-start gap-2.5">
              <div className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,var(--ib-acc)_25%,var(--ib-line))] bg-[var(--ib-accbg)] shadow-sm">
                <Image
                  src="/Icon.png"
                  alt=""
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                {showTyping && (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-[14px_14px_14px_4px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-3 shadow-sm"
                    aria-hidden
                  >
                    <span className="size-1.5 rounded-full bg-[var(--ib-acc)] motion-safe:animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-[var(--ib-acc)] motion-safe:animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-[var(--ib-acc)] motion-safe:animate-bounce [animation-delay:300ms]" />
                  </div>
                )}

                {showAnswer && (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="rounded-[14px_14px_14px_4px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-3 shadow-[0_8px_24px_-16px_rgba(11,18,32,0.2)]"
                  >
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ib-acc)]">
                      <Sparkles className="size-3.5" />
                      ISOBrain AI
                    </div>
                    <div className="space-y-2.5 text-sm leading-relaxed text-[var(--ib-ink)]">
                      {RESPONSE_PARTS.map((part) => (
                        <p key={part.cite}>
                          {part.text}{" "}
                          <span className="inline-block rounded-[5px] bg-[var(--ib-accbg)] px-[7px] py-px text-[11px] font-semibold text-[var(--ib-acc)]">
                            {part.cite}
                          </span>
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Related clause chips */}
            {(showAnswer || reduceMotion) && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.4 }}
                className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3"
              >
                {RELATED.map((r, i) => (
                  <div
                    key={r.t}
                    className={`rounded-[12px] border border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_92%,var(--ib-accbg))] px-[11px] py-[9px] text-[11.5px] text-[var(--ib-mute)] shadow-[0_1px_2px_rgba(11,18,32,0.03)] transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))] motion-safe:animate-[hero-float_6s_ease-in-out_infinite] ${
                      i === 1
                        ? "[animation-delay:0.8s]"
                        : i === 2
                          ? "[animation-delay:1.6s]"
                          : ""
                    }`}
                  >
                    <b className="block text-[12.5px] text-[var(--ib-ink)]">
                      {r.t}
                    </b>
                    {r.d}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating citation card */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0, y: 12, x: -4 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease }}
        className="absolute -bottom-2 -left-1 z-[2] hidden max-w-[210px] rounded-[14px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-3 py-2.5 shadow-[0_14px_36px_-14px_rgba(11,18,32,0.32)] sm:block motion-safe:animate-[hero-float_5.5s_ease-in-out_infinite]"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold leading-tight text-[var(--ib-ink)]">
              Cited from standard
            </p>
            <p className="text-[10px] text-[var(--ib-mute)]">
              ISO/IEC 27001:2022
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating library cue */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0, y: 10, x: 6 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.52, duration: 0.5, ease }}
        className="absolute -right-1 top-[42%] z-[2] hidden max-w-[168px] rounded-[14px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-3 py-2.5 shadow-[0_14px_36px_-14px_rgba(11,18,32,0.28)] md:block motion-safe:animate-[hero-float_6.5s_ease-in-out_infinite] motion-safe:[animation-delay:0.9s]"
      >
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--ib-okbg)] text-[var(--ib-ok)]">
            <BookOpen className="size-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-[var(--ib-ink)]">
              Clause-linked
            </p>
            <p className="text-[10px] text-[var(--ib-mute)]">Real ISO text</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
