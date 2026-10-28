"use client";

import ReviewSection from "@/components/AIAssistant/ReviewSection";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  BarChart3,
  Globe,
  GraduationCap,
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  Radar,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import {
  useState,
  useEffect,
  Fragment,
  type ComponentType,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useGetPlansQuery } from "@/lib/redux/features/pricing/pricingApi";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { userHasFeature, userOwnsPlanId } from "@/lib/access/effectiveAccess";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const ModuleCard = ({
  badge,
  code,
  title,
  description,
  href,
  cta,
  icon: Icon,
  reduceMotion,
  index,
}: {
  badge: string;
  code: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  reduceMotion: boolean | null;
  index: number;
}) => (
  <motion.article
    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      duration: 0.4,
      delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.3),
      ease,
    }}
    className="ib-card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-8 md:p-10"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-4 -bottom-4 text-[var(--ib-acc)] opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.12]"
    >
      <Icon className="size-36" aria-hidden />
    </div>

    <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-fit rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_20%,var(--ib-line))] bg-[var(--ib-accbg)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ib-acc)] sm:text-[11px]">
        {badge}
      </div>
      <div className="font-mono text-[10px] text-[var(--ib-mute)]">{code}</div>
    </div>

    <div className="relative z-[1] mt-5 flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
      <Icon className="size-5" aria-hidden />
    </div>

    <h3 className="relative z-[1] mb-0! mt-4 text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
      {title}
    </h3>
    <p className="relative z-[1] mt-3 flex-1 text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
      {description}
    </p>
    <Link
      href={href}
      className="group/btn relative z-[1] mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--ib-acc)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
    >
      {cta}
      <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" aria-hidden />
    </Link>
  </motion.article>
);

const AIAssistantHome = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const storedEndTime = localStorage.getItem("offerEndTime");
    const TOTAL_MS = 24 * 60 * 60 * 1000;
    let endTime = storedEndTime ? Number(storedEndTime) : Date.now() + TOTAL_MS;

    if (isNaN(endTime) || endTime <= Date.now()) {
      endTime = Date.now() + TOTAL_MS;
      localStorage.setItem("offerEndTime", endTime.toString());
    }

    const updateTimer = () => {
      const now = Date.now();
      let distance = endTime - now;
      if (distance <= 0) {
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
        distance = TOTAL_MS;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: response } = useGetPlansQuery();
  const user = useSelector(selectCurrentUser);
  const plans = response?.data || [];
  const plan =
    plans.find(
      (p) =>
        p.name?.toLowerCase().includes("ultra") ||
        p.name?.toLowerCase().includes("enterprise")
    ) || plans[2];
  const isPurchased =
    userOwnsPlanId(user, plan?.id || plan?._id) ||
    userHasFeature(user, "AI_ASSISTANT");

  const modules = [
    {
      badge: t("aiAssistantHome.protocolExecution"),
      code: t("aiAssistantHome.codeNav"),
      title: t("aiAssistantHome.isoNavigator"),
      description: t("aiAssistantHome.navigatorDesc"),
      href: `/${lang}/ai-assistant/iso-navigator`,
      cta: t("aiAssistantHome.initializeSync"),
      icon: Globe,
    },
    {
      badge: t("aiAssistantHome.forensicCore"),
      code: t("aiAssistantHome.codeAud"),
      title: t("aiAssistantHome.auditLens"),
      description: t("aiAssistantHome.auditDesc"),
      href: `/${lang}/ai-assistant/audit-lens`,
      cta: t("aiAssistantHome.auditBtn"),
      icon: ShieldCheck,
    },
    {
      badge: t("aiAssistantHome.evaluation"),
      code: t("aiAssistantHome.codeBen"),
      title: t("aiAssistantHome.benchmarkAi"),
      description: t("aiAssistantHome.benchmarkDesc"),
      href: `/${lang}/ai-assistant/benchmark-ai`,
      cta: t("aiAssistantHome.benchmarkBtn"),
      icon: BarChart3,
    },
    {
      badge: t("aiAssistantHome.knowledgeBase"),
      code: t("aiAssistantHome.codeLib"),
      title: t("aiAssistantHome.isoLibrary"),
      description: t("aiAssistantHome.libraryDesc"),
      href: `/${lang}/library/iso-standards`,
      cta: t("aiAssistantHome.libraryBtn"),
      icon: FileText,
    },
  ];

  const visualBeacons = [
    {
      icon: Workflow,
      label: t("aiAssistantHome.isoNavigator", "ISO Navigator"),
      href: `/${lang}/ai-assistant/iso-navigator`,
    },
    {
      icon: Radar,
      label: t("aiAssistantHome.auditLens", "Audit Lens"),
      href: `/${lang}/ai-assistant/audit-lens`,
    },
    {
      icon: Layers,
      label: t("aiAssistantHome.benchmarkAi", "Benchmark AI"),
      href: `/${lang}/ai-assistant/benchmark-ai`,
    },
    {
      icon: Cpu,
      label: t("aiAssistantHome.isoLibrary", "ISO Library"),
      href: `/${lang}/library/iso-standards`,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-accbg)] selection:text-[var(--ib-acc)]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative overflow-x-clip px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-18%] h-[620px] w-[min(1100px,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_18%,transparent),transparent_68%)]" />
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_10%,transparent)] blur-3xl" />
          <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_12%,transparent)] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in_srgb,var(--ib-line)_70%,transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in_srgb,var(--ib-line)_70%,transparent) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at center, black 20%, transparent 72%)",
            }}
          />
        </div>

        <div className="ib-w relative z-[1] max-w-7xl!">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="lg:col-span-6"
            >
              <div className="ib-eye inline-flex items-center gap-2">
                <Sparkles className="size-3.5" aria-hidden />
                {t("nav.aiAssistant")}
              </div>

              <h1 className="mb-0! mt-4 text-[34px] font-bold leading-[1.08] tracking-[-0.04em] text-[var(--ib-ink)] sm:text-[44px] lg:text-[52px]">
                {t("nav.aiAssistantSub.home", "ISOBrain AI Assistant")}
              </h1>

              <p className="mt-5 max-w-[540px] text-[15.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
                {t("platform.aiAssistant.description")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${lang}/ai-assistant/iso-navigator`}
                  className="group inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--ib-acc)] px-6 py-3.5 text-[13px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
                >
                  {t("aiAssistantHome.initializeSync", "Launch Navigator")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
                <Link
                  href={`/${lang}/pricing`}
                  className="inline-flex items-center justify-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-6 py-3.5 text-[13px] font-semibold text-[var(--ib-ink)] transition-all hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:bg-[var(--ib-accbg)]"
                >
                  {t("aiAssistantHome.getStartedBtn", "View Ultra plan")}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08, ease }}
              className="relative lg:col-span-6"
            >
              <div className="relative overflow-hidden rounded-[28px] border border-[var(--ib-line)] bg-[linear-gradient(160deg,var(--ib-card),color-mix(in_srgb,var(--ib-accbg)_55%,var(--ib-card)))] p-5 shadow-[0_28px_70px_-36px_rgba(27,77,219,0.45)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_18%,transparent)] blur-2xl"
                />
                <div className="relative z-[1] mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ib-acc)]">
                      Live toolkit
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-[var(--ib-ink)]">
                      Compliance intelligence stack
                    </p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--ib-acc)] text-white shadow-lg">
                    <Cpu className="size-5" aria-hidden />
                  </div>
                </div>

                <div className="relative z-[1] grid grid-cols-2 gap-3 sm:gap-4">
                  {visualBeacons.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : 0.12 + i * 0.05,
                        ease,
                      }}
                    >
                      <Link
                        href={item.href}
                        className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)]/90 p-4 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:shadow-[0_16px_36px_-24px_rgba(27,77,219,0.4)]"
                      >
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                          <item.icon className="size-5" aria-hidden />
                        </div>
                        <span className="text-[13px] font-semibold text-[var(--ib-ink)]">
                          {item.label}
                        </span>
                        <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[var(--ib-acc)] opacity-80 group-hover:opacity-100">
                          Open
                          <ArrowRight className="size-3.5" aria-hidden />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ── Ultra upsell (non-purchased) ──────────────────── */}
      {!isPurchased && (
        <section className="relative overflow-x-clip border-y border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] px-4 py-12 sm:px-6 sm:py-16">
          <div className="ib-w max-w-7xl!">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="ib-eye mb-3 inline-flex items-center gap-2">
                <BookOpen className="size-3.5" aria-hidden />
                {t("aiAssistantHome.claimDiscountBadge")}
              </div>

              <h2 className="mb-0! text-[24px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
                {t("aiAssistantHome.isobrainUltraTitle")}{" "}
                <span className="text-[var(--ib-acc)]">
                  {t(
                    "aiAssistantHome.isobrainUltraPrice",
                    "USD $13 per month, billed annually"
                  )}
                </span>
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[15.5px]">
                {t("aiAssistantHome.ultimateCompanionDesc")}
              </p>
              <p className="mt-2 max-w-lg text-[13px] italic leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                {t("aiAssistantHome.builtForAuditTeamsDesc")}
              </p>

              <p className="mt-5 text-[16px] font-semibold text-[var(--ib-ink)] sm:text-[18px]">
                {t("aiAssistantHome.enhanceSkillsHeading")}
              </p>

              <button
                type="button"
                onClick={() => router.push(`/${lang}/pricing`)}
                className="group mt-5 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[var(--ib-acc)] px-7 py-3.5 text-[12px] font-bold uppercase tracking-wider text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[13px]"
              >
                <span>{t("aiAssistantHome.getStartedBtn")}</span>
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </button>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 py-4 shadow-sm sm:gap-4 sm:px-8 sm:py-5">
                {[
                  { key: "hours", label: t("aiAssistantHome.hours"), value: timeLeft.hours },
                  { key: "mins", label: t("aiAssistantHome.mins"), value: timeLeft.minutes },
                  {
                    key: "secs",
                    label: t("aiAssistantHome.secs"),
                    value: timeLeft.seconds,
                    isAccent: true,
                  },
                ].map((time, index) => (
                  <Fragment key={time.key}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-12 items-center justify-center rounded-xl text-lg font-bold sm:size-14 sm:text-xl ${
                          time.isAccent
                            ? "border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                            : "border border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)]"
                        }`}
                      >
                        {time.value.toString().padStart(2, "0")}
                      </div>
                      <span
                        className={`mt-1.5 text-[9px] font-semibold uppercase tracking-widest sm:text-[10px] ${
                          time.isAccent ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"
                        }`}
                      >
                        {time.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <span className="mb-5 text-xl font-bold text-[var(--ib-mute)] sm:text-2xl">
                        :
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-5xl border-t border-[var(--ib-line)] pt-12 text-center">
              <h3 className="mb-0! text-[18px] font-semibold uppercase tracking-wider text-[var(--ib-ink)] sm:text-[20px]">
                {t("aiAssistantHome.forUSDYouGet")}
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-[14px] text-[var(--ib-mute)] sm:text-[15px]">
                {t("aiAssistantHome.everythingInPro")}
              </p>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-10">
                {[
                  {
                    title: t("aiAssistantHome.unlimitedAIAccessTitle"),
                    desc: t("aiAssistantHome.unlimitedAIAccessDesc"),
                  },
                  {
                    title: t("aiAssistantHome.isoNavigatorTitle"),
                    desc: t("aiAssistantHome.isoNavigatorBenefitDesc"),
                  },
                  {
                    title: t("aiAssistantHome.auditLensTitle"),
                    desc: t("aiAssistantHome.auditLensBenefitDesc"),
                  },
                  {
                    title: t("aiAssistantHome.benchmarkAITitle"),
                    desc: t("aiAssistantHome.benchmarkAIBenefitDesc"),
                  },
                ].map((b) => (
                  <div key={b.title} className="space-y-2">
                    <h4 className="mb-0! text-[14px] font-bold uppercase tracking-wide text-[var(--ib-acc)] sm:text-[15px]">
                      {b.title}
                    </h4>
                    <p className="mx-auto max-w-md text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── AI Modules ───────────────────────────────────── */}
      <section className="relative px-4 py-14 sm:px-6 sm:py-20">
        <div className="ib-w max-w-7xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease }}
            className="mx-auto mb-10 max-w-[720px] text-center md:mb-14"
          >
            <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px]">
              {t("aiAssistantHome.neuralEcosystemTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
              {t("aiAssistantHome.neuralEcosystemDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {modules.map((mod, index) => (
              <ModuleCard key={mod.href} {...mod} index={index} reduceMotion={reduceMotion} />
            ))}
          </div>

          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease }}
            className="ib-card group relative mt-5 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:mt-6 sm:p-8 md:mx-auto md:max-w-4xl md:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-4 -bottom-4 text-[var(--ib-acc)] opacity-[0.08] transition-opacity group-hover:opacity-[0.14]"
            >
              <GraduationCap className="size-40" aria-hidden />
            </div>
            <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-fit rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_20%,var(--ib-line))] bg-[var(--ib-accbg)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ib-acc)] sm:text-[11px]">
                {t("aiAssistantHome.isoAcademyBadge")}
              </div>
              <div className="font-mono text-[10px] text-[var(--ib-mute)]">
                {t("aiAssistantHome.codeAca")}
              </div>
            </div>
            <h3 className="relative z-[1] mb-0! mt-5 text-[22px] font-bold text-[var(--ib-ink)] sm:text-[24px]">
              {t("aiAssistantHome.isoAcademy")}
            </h3>
            <p className="relative z-[1] mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
              {t("aiAssistantHome.academyCardDesc")}
            </p>
            <Link
              href={`/${lang}/academy`}
              className="group/btn relative z-[1] mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--ib-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("aiAssistantHome.startLearning")}
              <ArrowRight
                className="size-4 transition-transform group-hover/btn:translate-x-1"
                aria-hidden
              />
            </Link>
          </motion.article>
        </div>
      </section>

      <div className="bg-[var(--ib-bg)] pb-24">
        <ReviewSection />
      </div>

      <Footer />
    </div>
  );
};

export default AIAssistantHome;
