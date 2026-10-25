"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const STEPS: {
  n: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    n: "01",
    title: "Assess",
    description:
      "Take a role-based assessment in Mastery Lab and see exactly where knowledge falls short.",
    icon: ClipboardCheck,
  },
  {
    n: "02",
    title: "Learn",
    description:
      "Follow structured paths in ISO Academy, with real-world examples and interactive tools.",
    icon: GraduationCap,
  },
  {
    n: "03",
    title: "Apply",
    description:
      "Ask the AI Assistant and search the Library to put each clause into practice.",
    icon: Sparkles,
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="ib-section">
      <div className="ib-w">
        <div className="mb-12 max-w-[680px]">
          <div className="ib-eye">How it works</div>
          <h2 className="mb-0!">
            From “where do we stand?” to audit-ready in three steps
          </h2>
          <p className="mt-3.5 text-[17px] text-[var(--ib-mute)]">
            Most tools cover one part of the process. ISOBrain gives you a
            single path, so you always know what to do next and why.
          </p>
        </div>

        <ol className="relative grid list-none grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch md:gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="contents">
                <motion.li
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="min-w-0"
                >
                  <article className="ib-card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-7">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,color-mix(in_srgb,var(--ib-acc)_12%,transparent),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div className="relative z-[1] mb-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-bg)] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[var(--ib-acc)] uppercase">
                        Step {step.n}
                      </span>
                      <span className="grid size-11 place-items-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-acc)] transition-transform duration-300 group-hover:scale-105">
                        <Icon
                          className="size-5"
                          strokeWidth={1.85}
                          aria-hidden
                        />
                      </span>
                    </div>

                    <h3 className="relative z-[1] mb-2.5 text-[20px]! tracking-[-0.02em] sm:text-[22px]!">
                      {step.title}
                    </h3>
                    <p className="relative z-[1] text-[15px] leading-relaxed text-[var(--ib-mute)]">
                      {step.description}
                    </p>
                  </article>

                  {/* Mobile progression marker */}
                  {index < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className="mx-auto my-1 flex h-8 w-8 items-center justify-center text-[var(--ib-acc)] md:hidden"
                    >
                      <ArrowRight className="size-4 rotate-90" />
                    </div>
                  )}
                </motion.li>

                {index < STEPS.length - 1 && (
                  <li
                    aria-hidden
                    className="hidden items-center justify-center px-2 md:flex"
                  >
                    <span className="grid size-9 place-items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-acc)] shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                      <ArrowRight className="size-4" />
                    </span>
                  </li>
                )}
              </div>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
