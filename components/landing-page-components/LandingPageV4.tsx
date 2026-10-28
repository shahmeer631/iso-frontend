"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Brain,
  GraduationCap,
  Library,
  Microscope,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import BrandName from "@/components/landing-page-components/BrandName";
import HeroAIPreview from "@/components/landing-page-components/HeroAIPreview";
import TestimonialsMarquee from "@/components/landing-page-components/TestimonialsMarquee";
import HowItWorks from "@/components/landing-page-components/HowItWorks";
import ProductEcosystem from "@/components/landing-page-components/ProductEcosystem";

const heroEase = [0.22, 1, 0.36, 1] as const;

const heroFadeUp = (reduceMotion: boolean | null, delay = 0) =>
  reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: heroEase },
      };

type ProductShowcase = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  reverse: boolean;
  eyebrow: string;
};

const PRODUCTS: Omit<ProductShowcase, "href">[] = [
  {
    id: "mastery-lab",
    title: "Mastery Lab",
    description:
      "See your gaps. Fix them fast. You can’t improve what you can’t see. ISOBrain assesses your knowledge based on your role and responsibilities, then shows you exactly where you’re falling short. No guesswork. No wasted time. Just a clear path forward.",
    cta: "Open Mastery Lab",
    icon: Microscope,
    reverse: false,
    eyebrow: "01 · Assess",
  },
  {
    id: "library",
    title: "ISO Library",
    description:
      "Work with the standards, not around them. Access ISO compliance standards in a way that makes sense. Search, explore, and break down complex clauses into something you can understand and act on—without getting lost in pages of documentation.",
    cta: "Explore ISO Standards",
    icon: Library,
    reverse: true,
    eyebrow: "02 · Learn",
  },
  {
    id: "academy",
    title: "ISO Academy",
    description:
      "With your weaknesses identified and understood, move into structured, comprehensive learning. Adaptive paths fast-track what you already know and ensure no compliance requirement is left unchecked.",
    cta: "Explore Academy Courses",
    icon: GraduationCap,
    reverse: false,
    eyebrow: "03 · Master",
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description:
      "Knowing the standard is only half the battle—implementing it is the goal. Your Compliance Co-Pilot helps draft SOPs, prepare audits, and bridge theory with real-world execution.",
    cta: "Explore AI Assistant",
    icon: Brain,
    reverse: true,
    eyebrow: "04 · Apply",
  },
];

export default function LandingPageV4() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const base = `/${lang}`;
  const reduceMotion = useReducedMotion();

  const products: ProductShowcase[] = PRODUCTS.map((p) => ({
    ...p,
    href:
      p.id === "ai-assistant"
        ? `${base}/ai-assistant-home`
        : p.id === "academy"
          ? `${base}/academy`
          : p.id === "mastery-lab"
            ? `${base}/mastery-lab`
            : `${base}/library/iso-standards`,
  }));

  return (
    <div className="bg-[var(--ib-bg)] text-[var(--ib-ink)] text-left">
      <header className="relative overflow-x-clip pt-[76px] pb-16 sm:pb-[72px] lg:pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <div className="absolute -left-[12%] top-[-8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_12s_ease-in-out_infinite_alternate]" />
          <div className="absolute right-[-8%] top-[18%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_70%)] blur-2xl motion-safe:animate-[hero-glow_14s_ease-in-out_infinite_alternate] motion-safe:[animation-delay:1.2s]" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 35%, black 10%, transparent 72%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ib-bg)] to-transparent" />
        </div>

        <div className="ib-w relative z-[1] grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.02fr_1.08fr] lg:gap-14 xl:gap-16">
          <div className="min-w-0">
            <motion.span
              {...heroFadeUp(reduceMotion, 0)}
              className="ib-pill border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] shadow-[0_1px_0_color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
            >
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              Assess · Learn · Master · Apply
            </motion.span>

            <motion.h1
              {...heroFadeUp(reduceMotion, 0.08)}
              className="mt-5 mb-0! max-w-[640px] text-[36px] font-bold leading-[1.08] tracking-[-0.038em] sm:text-[42px] lg:text-[54px]"
            >
              See where you stand.{" "}
              <span className="bg-[linear-gradient(105deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_55%,var(--ib-ink))_48%,var(--ib-ink)_100%)] bg-clip-text text-transparent">
                Close the gaps. Apply the standard.
              </span>
            </motion.h1>

            <motion.p
              {...heroFadeUp(reduceMotion, 0.16)}
              className="mt-5 max-w-[540px] text-[17px] leading-[1.65] text-[var(--ib-mute)] sm:text-lg"
            >
              ISOBrain connects Mastery Lab, ISO Library, Academy, and AI
              Assistant into one path—so compliance teams, auditors, and
              consultants can learn, measure, and implement ISO with clarity.
            </motion.p>

            <motion.div
              {...heroFadeUp(reduceMotion, 0.24)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href={`${base}/mastery-lab`}
                className="ib-btn shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity,background-color] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-[0_14px_32px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                Start Mastery Lab →
              </Link>
              <Link
                href={`${base}/auth/sign-up`}
                className="ib-btn ib-btn-o transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_10px_24px_-14px_rgba(11,18,32,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                Create your account
              </Link>
            </motion.div>

            <motion.div
              {...heroFadeUp(reduceMotion, 0.32)}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[var(--ib-mute)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="flex size-4 items-center justify-center rounded-full bg-[var(--ib-okbg)] text-[10px] font-bold text-[var(--ib-ok)]"
                  aria-hidden
                >
                  ✓
                </span>
                Cancel anytime in 2 clicks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="flex size-4 items-center justify-center rounded-full bg-[var(--ib-okbg)] text-[10px] font-bold text-[var(--ib-ok)]"
                  aria-hidden
                >
                  ✓
                </span>
                Guidance grounded in real ISO standards
              </span>
            </motion.div>
          </div>

          <HeroAIPreview />
        </div>
      </header>

      <BrandName showTrustedLabel />

      <HowItWorks />

      <ProductEcosystem products={products} />

      <section className="ib-section overflow-hidden">
        <div className="ib-w">
          <div className="mb-10 max-w-[680px] md:mb-12">
            <div className="ib-eye">Trusted by professionals</div>
            <h2 className="mb-0!">Built for people who need to get it right</h2>
          </div>
        </div>
        <TestimonialsMarquee />
      </section>

      <section className="relative overflow-x-clip pt-5 pb-[92px]">
        <div className="ib-w">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: heroEase }}
            className="relative overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[linear-gradient(135deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_78%,#0B1B4A)_52%,#0E2A6B_100%)] px-7 py-11 text-white shadow-[0_28px_64px_-28px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] sm:px-10 sm:py-14 md:rounded-[28px] md:px-12 md:py-16"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-[10%] -top-[30%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_11s_ease-in-out_infinite_alternate]" />
              <div className="absolute -bottom-[35%] -right-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(122,162,255,0.35),transparent_70%)] blur-2xl motion-safe:animate-[hero-glow_13s_ease-in-out_infinite_alternate] motion-safe:[animation-delay:1s]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </div>

            <div className="relative z-[1] flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-10">
              <div className="min-w-0 max-w-[640px]">
                <motion.h2
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : 0.08,
                    ease: heroEase,
                  }}
                  className="mb-0! max-w-[560px] text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-white! sm:text-[32px] md:text-[38px]"
                >
                  Ready to see your gaps in{" "}
                  <span className="bg-[linear-gradient(105deg,#FFFFFF_0%,#C9D8FF_55%,#FFFFFF_100%)] bg-clip-text text-transparent">
                    Mastery Lab
                  </span>
                  ?
                </motion.h2>
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : 0.16,
                    ease: heroEase,
                  }}
                  className="mt-3 max-w-[500px] text-[15.5px] leading-[1.6] text-white/85 sm:text-base"
                >
                  Configure your role, start a free assessment, and get a clear
                  path from where you are to what to learn and apply next.
                </motion.p>
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.24,
                  ease: heroEase,
                }}
                className="shrink-0"
              >
                <Link
                  href={`${base}/mastery-lab`}
                  className="group inline-flex items-center gap-2 rounded-[12px] border border-white/90 bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[var(--ib-ink)] shadow-[0_12px_32px_-12px_rgba(11,18,32,0.45)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#F7F9FF] hover:shadow-[0_16px_36px_-10px_rgba(11,18,32,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Go to Mastery Lab
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
