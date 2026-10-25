"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import AISimulation from "@/components/landing-page-components/AISimulation";

const ease = [0.22, 1, 0.36, 1] as const;

function fadeUp(reduceMotion: boolean | null, delay = 0) {
  return reduceMotion
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.35 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.35 },
        transition: { duration: 0.5, delay, ease },
      };
}

export default function AboutClient() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const base = `/${lang}`;
  const reduceMotion = useReducedMotion();

  const ecosystem: {
    title: string;
    text: string;
    icon: LucideIcon;
  }[] = useMemo(
    () => [
      {
        title: t("aboutPage.assessmentTitle"),
        text: t("aboutPage.assessment"),
        icon: Target,
      },
      {
        title: t("aboutPage.learningTitle"),
        text: t("aboutPage.learning"),
        icon: GraduationCap,
      },
      {
        title: t("aboutPage.guidanceTitle"),
        text: t("aboutPage.guidance"),
        icon: Zap,
      },
      {
        title: t("aboutPage.applicationTitle"),
        text: t("aboutPage.application"),
        icon: Shield,
      },
    ],
    [t]
  );

  const whoItems = t("aboutPage.whoItems", {
    returnObjects: true,
  }) as string[];

  const heroHeading = t("aboutPage.heroHeading");
  const accentMatch = heroHeading.match(/^(.*?)(without the confusion\.?)$/i);
  const problemTitle = t("aboutPage.problemTitle");

  return (
    <div className="bg-[var(--ib-bg)] text-[var(--ib-ink)] text-left min-h-screen">
      {/* 1. Hero */}
      <header className="relative overflow-x-clip pt-[88px] pb-14 sm:pb-20 lg:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_12s_ease-in-out_infinite_alternate]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 65% 55% at 50% 30%, black 12%, transparent 72%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--ib-bg)] to-transparent" />
        </div>

        <div className="ib-w relative z-[1]">
          <div className="mx-auto max-w-[760px] text-center">
            <motion.span
              {...fadeUp(reduceMotion, 0)}
              className="ib-pill mx-auto border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] shadow-[0_1px_0_color-mix(in_srgb,var(--ib-acc)_12%,transparent)]"
            >
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              {t("aboutPage.badge")}
            </motion.span>

            <motion.h1
              {...fadeUp(reduceMotion, 0.08)}
              className="mt-6 mb-0! text-[36px] font-bold leading-[1.08] tracking-[-0.038em] sm:text-[48px] lg:text-[54px]"
            >
              {accentMatch ? (
                <>
                  {accentMatch[1]}
                  <span className="bg-[linear-gradient(105deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_50%,var(--ib-ink))_50%,var(--ib-ink)_100%)] bg-clip-text text-transparent">
                    {accentMatch[2]}
                  </span>
                </>
              ) : (
                heroHeading
              )}
            </motion.h1>

            <motion.p
              {...fadeUp(reduceMotion, 0.16)}
              className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[var(--ib-mute)] sm:text-[17px] lg:text-lg"
            >
              {t("aboutPage.description")}
            </motion.p>
          </div>
        </div>
      </header>

      {/* 2. The Problem */}
      <section className="relative overflow-x-clip border-y border-[var(--ib-line)] bg-[var(--ib-card)] py-14 sm:py-20 lg:py-24">
        <div className="ib-w grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <motion.div {...fadeUp(reduceMotion, 0)} className="min-w-0">
            <h2 className="mb-0! max-w-[520px] text-[28px] font-bold leading-[1.12] tracking-[-0.03em] text-[var(--ib-acc)] sm:text-[34px] lg:text-[42px]">
              {problemTitle}
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base lg:text-[17px]">
              {t("aboutPage.problemText")}
            </p>
            <Link
              href={`${base}/library/iso-standards`}
              className="ib-btn mt-8 shadow-[0_10px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-[0_14px_32px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("aboutPage.cta")} →
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease, delay: reduceMotion ? 0 : 0.1 }}
            className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--ib-acc)_20%,transparent),transparent_58%)] motion-safe:animate-[hero-glow_10s_ease-in-out_infinite_alternate]"
            />
            <div
              aria-hidden
              className="absolute inset-x-3 top-4 bottom-2 -z-[1] hidden rounded-[18px] border border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] opacity-70 sm:block motion-safe:translate-x-2 motion-safe:translate-y-2"
            />
            <div className="relative overflow-hidden rounded-2xl shadow-[0_28px_64px_-28px_rgba(11,18,32,0.3)] ring-1 ring-[color-mix(in_srgb,var(--ib-acc)_12%,transparent)]">
              <AISimulation />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Core Ecosystem */}
      <section className="ib-section overflow-x-clip">
        <div className="ib-w">
          <motion.div
            {...fadeUp(reduceMotion, 0)}
            className="mx-auto mb-12 max-w-[680px] text-center md:mb-14"
          >
            <div className="ib-eye">Core ecosystem</div>
            <h2 className="mb-0! text-[28px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[34px] lg:text-[38px]">
              {t("aboutPage.systemHeading")}
            </h2>
            <p className="mt-3.5 text-[16px] text-[var(--ib-mute)] sm:text-[17px]">
              {t("aboutPage.systemSubheading")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {ecosystem.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : i * 0.08,
                    ease,
                  }}
                  className="ib-card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-7"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,color-mix(in_srgb,var(--ib-acc)_12%,transparent),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative z-[1] mb-5 flex size-12 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)] transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="relative z-[1] mb-2.5 text-[18px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                    {item.title}
                  </h3>
                  <p className="relative z-[1] text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                    {item.text}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Who It’s For */}
      <section className="ib-section ib-section-alt overflow-x-clip">
        <div className="ib-w">
          <motion.div
            {...fadeUp(reduceMotion, 0)}
            className="mx-auto max-w-[760px] text-center"
          >
            <div className="ib-eye">Audience</div>
            <h2 className="mb-0! text-[28px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[34px] lg:text-[38px]">
              {t("aboutPage.whoTitle")}
            </h2>
            <p className="mt-3.5 text-[16px] text-[var(--ib-mute)] sm:text-[17px]">
              {t("aboutPage.whoSubtitle")}
            </p>
          </motion.div>

          <div className="mx-auto mt-10 grid max-w-[920px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {Array.isArray(whoItems) &&
              whoItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : i * 0.07,
                    ease,
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_12px_28px_-18px_rgba(27,77,219,0.3)]"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                    <CheckCircle2 className="size-4" aria-hidden />
                  </span>
                  <span className="text-left text-[14.5px] font-semibold text-[var(--ib-ink)]">
                    {item}
                  </span>
                </motion.div>
              ))}
          </div>

          <motion.p
            {...fadeUp(reduceMotion, 0.12)}
            className="mx-auto mt-10 max-w-[640px] text-center text-[15.5px] leading-relaxed text-[var(--ib-mute)] sm:text-base"
          >
            {t("aboutPage.whoFinal")}
          </motion.p>
        </div>
      </section>

      {/* 5. Approach / Final CTA */}
      <section className="relative overflow-x-clip pt-5 pb-[92px]">
        <div className="ib-w">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease }}
            className="relative overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[linear-gradient(135deg,var(--ib-acc)_0%,color-mix(in_srgb,var(--ib-acc)_78%,#0B1B4A)_52%,#0E2A6B_100%)] px-7 py-12 text-white shadow-[0_28px_64px_-28px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] sm:px-10 sm:py-14 md:rounded-[28px] md:px-12 md:py-16"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-[10%] -top-[30%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_11s_ease-in-out_infinite_alternate]" />
              <div className="absolute -bottom-[35%] -right-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(122,162,255,0.35),transparent_70%)] blur-2xl motion-safe:animate-[hero-glow_13s_ease-in-out_infinite_alternate] motion-safe:[animation-delay:1s]" />
              <div
                className="absolute inset-0 opacity-[0.16]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                  maskImage:
                    "radial-gradient(ellipse 75% 70% at 50% 45%, black 15%, transparent 75%)",
                }}
              />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </div>

            <div className="relative z-[1] mx-auto max-w-[720px] text-center">
              <motion.h2
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.08,
                  ease,
                }}
                className="mb-0! text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-white! sm:text-[32px] md:text-[38px]"
              >
                {t("aboutPage.approachTitle")}
              </motion.h2>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.16,
                  ease,
                }}
                className="mx-auto mt-4 max-w-[560px] text-[15.5px] leading-[1.65] text-white/85 sm:text-base"
              >
                {t("aboutPage.approachText")}
              </motion.p>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.24,
                  ease,
                }}
                className="mt-8"
              >
                <Link
                  href={`${base}/library/iso-standards`}
                  className="group inline-flex items-center gap-2 rounded-[12px] border border-white/90 bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[var(--ib-ink)] shadow-[0_12px_32px_-12px_rgba(11,18,32,0.45)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#F7F9FF] hover:shadow-[0_16px_36px_-10px_rgba(11,18,32,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t("pricingPage.startAssessment")}
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
