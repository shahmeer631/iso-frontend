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
  image: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  reverse: boolean;
};

const PRODUCTS: Omit<ProductShowcase, "href">[] = [
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description:
      "Get answers when you need them. Stop digging through documents or second-guessing your interpretation. Ask a question and get a clear, structured answer based on real ISO standards. Whether you're working through a clause, preparing for an audit, or building a process, you'll get guidance you can actually use.",
    image: "/ai-assistant.png",
    cta: "Explore AI Assistant",
    icon: Brain,
    reverse: false,
  },
  {
    id: "academy",
    title: "ISO Academy",
    description:
      "Learn it properly. Apply it confidently. Most courses stop at theory. ISOBrain shows you how it works in practice—structured learning paths, real-world examples, and interactive compliance tools for enterprises and individuals.",
    image: "/academy.png",
    cta: "Explore Academy Courses",
    icon: GraduationCap,
    reverse: true,
  },
  {
    id: "mastery-lab",
    title: "Mastery Lab",
    description:
      "See your gaps. Fix them fast. You can't improve what you can't see. ISOBrain assesses your knowledge based on your role and responsibilities, then shows you exactly where you're falling short—with a clear path forward.",
    image: "/mastery-lab.png",
    cta: "Test Your Knowledge",
    icon: Microscope,
    reverse: false,
  },
  {
    id: "library",
    title: "ISO Library",
    description:
      "Work with the standards, not around them. Search, explore, and break down complex clauses into something you can understand and act on—without getting lost in pages of documentation.",
    image: "/library.png",
    cta: "Explore ISO Standards",
    icon: Library,
    reverse: true,
  },
];

const FAQ = [
  {
    q: "Who is ISOBrain for?",
    a: "Compliance teams, auditors, QHSE managers and ISO consultants, as well as individuals who want to learn and apply the standards.",
  },
  {
    q: "How does the AI Assistant answer questions?",
    a: "It gives clear, structured answers based on real ISO standards, so you can work through a clause or prepare for an audit with guidance you can use.",
  },
  {
    q: "Where should I start?",
    a: "Take the free assessment in Mastery Lab. It shows where your gaps are and points you to the right learning path.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel in 2 clicks.",
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
      {/* Hero */}
      <header className="relative overflow-x-clip pt-[76px] pb-16 sm:pb-[72px] lg:pb-20">
        {/* Ambient background — restrained brand glow + soft grid */}
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
              Next-gen ISO compliance software
            </motion.span>

            <motion.h1
              {...heroFadeUp(reduceMotion, 0.08)}
              className="mt-5 mb-0! max-w-[620px] text-[36px] font-bold leading-[1.08] tracking-[-0.038em] sm:text-[42px] lg:text-[54px]"
            >
              Turn ISO standards into{" "}
              <span className="bg-[linear-gradient(105deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_55%,var(--ib-ink))_48%,var(--ib-ink)_100%)] bg-clip-text text-transparent">
                clear, actionable steps
              </span>
              .
            </motion.h1>

            <motion.p
              {...heroFadeUp(reduceMotion, 0.16)}
              className="mt-5 max-w-[520px] text-[17px] leading-[1.65] text-[var(--ib-mute)] sm:text-lg"
            >
              Compliance teams, auditors and consultants use ISOBrain to learn
              the standards, find their gaps and prepare for audits, all in one
              place.
            </motion.p>

            <motion.div
              {...heroFadeUp(reduceMotion, 0.24)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href={`${base}/auth/sign-up`}
                className="ib-btn shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity,background-color] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-[0_14px_32px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                Get started now →
              </Link>
              <Link
                href={`${base}/mastery-lab`}
                className="ib-btn ib-btn-o transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_10px_24px_-14px_rgba(11,18,32,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
              >
                Take the free assessment
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
                Answers based on real ISO standards
              </span>
            </motion.div>
          </div>

          <HeroAIPreview />
        </div>
      </header>

      {/* Proof bar — animated company logos */}
      <BrandName showTrustedLabel />

      <HowItWorks />

      <ProductEcosystem products={products} />

      {/* Testimonials — continuous moving strips */}
      <section className="ib-section overflow-hidden">
        <div className="ib-w">
          <div className="mb-10 max-w-[680px] md:mb-12">
            <div className="ib-eye">Trusted by professionals</div>
            <h2 className="mb-0!">Built for people who need to get it right</h2>
          </div>
        </div>
        <TestimonialsMarquee />
      </section>

      {/* FAQ */}
      <section className="ib-section ib-section-alt">
        <div className="ib-w max-w-[780px]! mx-auto">
          <div className="max-w-[680px] mb-12">
            <div className="ib-eye">FAQ</div>
            <h2 className="mb-0!">Common questions</h2>
          </div>
          <div>
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="border-b border-[var(--ib-line)] py-5 group"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-[22px] leading-none text-[var(--ib-mute)] group-open:hidden">
                    +
                  </span>
                  <span className="hidden text-[22px] leading-none text-[var(--ib-mute)] group-open:inline">
                    –
                  </span>
                </summary>
                <p className="mt-2.5 text-[var(--ib-mute)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-x-clip pt-5 pb-[92px]">
        <div className="ib-w">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: heroEase }}
            className="relative overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[linear-gradient(135deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_78%,#0B1B4A)_52%,#0E2A6B_100%)] px-7 py-11 text-white shadow-[0_28px_64px_-28px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] sm:px-10 sm:py-14 md:rounded-[28px] md:px-12 md:py-16"
          >
            {/* Ambient depth layers */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-[10%] -top-[30%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_11s_ease-in-out_infinite_alternate]" />
              <div className="absolute -bottom-[35%] -right-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(122,162,255,0.35),transparent_70%)] blur-2xl motion-safe:animate-[hero-glow_13s_ease-in-out_infinite_alternate] motion-safe:[animation-delay:1s]" />
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  maskImage:
                    "radial-gradient(ellipse 75% 70% at 40% 50%, black 15%, transparent 75%)",
                }}
              />
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
                  Ready to see where you{" "}
                  <span className="bg-[linear-gradient(105deg,#FFFFFF_0%,#C9D8FF_55%,#FFFFFF_100%)] bg-clip-text text-transparent">
                    stand
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
                  className="mt-3 max-w-[480px] text-[15.5px] leading-[1.6] text-white/85 sm:text-base"
                >
                  Get clarity on what’s working, what’s missing and what to do
                  next.
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
                  Start your free assessment
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
