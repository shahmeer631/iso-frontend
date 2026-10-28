"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const STEPS: {
  n: string;
  title: string;
  product: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    n: "01",
    title: "Assess",
    product: "Mastery Lab",
    description:
      "Your journey begins with a clear view of where you stand. Mastery Lab evaluates baseline competency so you never waste time studying what you already know.",
    icon: ClipboardCheck,
  },
  {
    n: "02",
    title: "Learn",
    product: "ISO Library",
    description:
      "Once gaps are clear, the Library translates complex ISO jargon into actionable insights—AI-summarized guides, examples, and plain-English explanations.",
    icon: BookOpen,
  },
  {
    n: "03",
    title: "Master",
    product: "ISO Academy",
    description:
      "Move into structured learning paths that adapt to your competency profile. Step-by-step courses ensure no compliance requirement is left unchecked.",
    icon: GraduationCap,
  },
  {
    n: "04",
    title: "Apply",
    product: "AI Assistant",
    description:
      "Put the standard into practice with your Compliance Co-Pilot—draft SOPs, prepare audits, and bridge theory with real-world execution.",
    icon: Sparkles,
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="ib-section">
      <div className="ib-w">
        <div className="mb-12 max-w-[720px]">
          <div className="ib-eye">How it works</div>
          <h2 className="mb-0!">
            Assess · Learn · Master · Apply
          </h2>
          <p className="mt-3.5 text-[17px] text-[var(--ib-mute)]">
            ISOBrain connects four tools into one path—so you always know where
            you stand, what to learn next, and how to apply it.
          </p>
        </div>

        <ol className="relative grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative min-w-0"
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
                      <Icon className="size-5" strokeWidth={1.85} aria-hidden />
                    </span>
                  </div>

                  <h3 className="relative z-[1] mb-1 text-[20px]! tracking-[-0.02em] sm:text-[22px]!">
                    {step.title}
                  </h3>
                  <p className="relative z-[1] mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--ib-acc)]">
                    {step.product}
                  </p>
                  <p className="relative z-[1] text-[15px] leading-relaxed text-[var(--ib-mute)]">
                    {step.description}
                  </p>
                </article>

                {index < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 xl:flex"
                  >
                    <span className="grid size-8 place-items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-acc)] shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
