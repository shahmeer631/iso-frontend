"use client";

import { FC } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock3,
  GraduationCap,
  Mail,
  MapPin,
  Microscope,
  Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import Link from "next/link";
import { useParams } from "next/navigation";

const HELP_TOPICS = [
  {
    title: "Mastery Lab assessments",
    body: "Questions about role-based assessments, scoring, or how gap reports map to learning paths.",
    icon: Microscope,
    href: "/mastery-lab",
  },
  {
    title: "ISO Library & standards",
    body: "Help finding clauses, editions, or how Library insights connect to your assessment results.",
    icon: BookOpen,
    href: "/library/iso-standards",
  },
  {
    title: "Academy courses",
    body: "Enrollment, course access, learning paths, and certification-oriented curricula.",
    icon: GraduationCap,
    href: "/academy",
  },
  {
    title: "AI Assistant tools",
    body: "Support for ISO Navigator, Audit Lens, Benchmark AI, and document generation workflows.",
    icon: Brain,
    href: "/ai-assistant-home",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const fieldClassName =
  "mt-1.5 block w-full rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3 text-[15px] text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))] focus:border-[var(--ib-acc)] focus:bg-[var(--ib-card)] focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ib-acc)_16%,transparent)]";

const labelClassName =
  "block text-[13.5px] font-semibold tracking-[-0.01em] text-[var(--ib-ink)]";

const ContactSection: FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const reveal = (delay = 0) =>
    reduceMotion
      ? {
          initial: false as const,
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.5, delay, ease },
        };

  return (
    <section className="relative overflow-x-clip bg-[var(--ib-bg)] py-12 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[8%] top-[12%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_70%)] blur-2xl"
      />

      <div className="ib-w relative z-[1]">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 xl:gap-12">
          {/* Form */}
          <motion.div
            {...reveal(0)}
            className="ib-card relative overflow-hidden p-6 shadow-[0_20px_48px_-28px_rgba(11,18,32,0.22)] sm:p-8 lg:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_55%)]"
            />
            <div className="relative z-[1]">
              <div className="ib-eye">Message</div>
              <h2 className="mb-0! text-[26px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
                {t("contact.sendMessage")}
              </h2>

              <form className="mt-8 space-y-5">
                <div>
                  <label htmlFor="fullName" className={labelClassName}>
                    {t("auth.fullName")}
                    <span className="text-red-500" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder={t("dynamic.dyn_johnDoe_42")}
                    className={fieldClassName}
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClassName}>
                    {t("auth.emailAddress")}
                    <span className="text-red-500" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t("dynamic.dyn_youexamplecom_43")}
                    className={fieldClassName}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="company" className={labelClassName}>
                    {t("contact.companyOptional")}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder={t("dynamic.dyn_yourCompany_44")}
                    className={fieldClassName}
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClassName}>
                    {t("contact.message")}{" "}
                    <span className="text-red-500" aria-hidden>
                      *
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder={t("contact.messagePlaceholder")}
                    className={`${fieldClassName} min-h-[140px] resize-y`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--ib-acc)] bg-[var(--ib-acc)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--ib-acc)_55%,transparent)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-[0_16px_36px_-10px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                >
                  {t("contact.sendButton")}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Info column */}
          <div className="flex flex-col gap-5 sm:gap-6">
            <motion.div
              {...reveal(0.08)}
              className="ib-card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.28)] sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative z-[1]">
                <h3 className="mb-0! text-[20px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[22px]">
                  {t("contact.contactInfo")}
                </h3>

                <ul className="mt-6 space-y-5">
                  <li className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                      <Mail className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--ib-mute)]">
                        {t("contact.email")}
                      </p>
                      <a
                        href="mailto:support@isobrain.ai"
                        className="mt-0.5 break-all text-[15px] font-medium text-[var(--ib-ink)] transition-colors hover:text-[var(--ib-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                      >
                        support@isobrain.ai
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                      <Phone className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--ib-mute)]">
                        {t("contact.phone")}
                      </p>
                      <a
                        href="tel:+15551234567"
                        className="mt-0.5 text-[15px] font-medium text-[var(--ib-ink)] transition-colors hover:text-[var(--ib-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--ib-mute)]">
                        {t("contact.office")}
                      </p>
                      <p className="mt-0.5 text-[15px] leading-relaxed text-[var(--ib-ink)]">
                        123 ISO Street
                        <br />
                        San Francisco, CA 94107
                        <br />
                        United States
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              {...reveal(0.16)}
              className="ib-card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.28)] sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--ib-acc)_10%,transparent),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative z-[1]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                    <Clock3 className="size-4" aria-hidden />
                  </span>
                  <h3 className="mb-0! text-[20px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[22px]">
                    {t("contact.businessHours")}
                  </h3>
                </div>

                <div className="space-y-3 text-[14.5px] text-[var(--ib-mute)]">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3">
                    <span className="font-semibold text-[var(--ib-ink)]">
                      {t("contact.monFri")}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {t("dynamic.dyn_900AM6_40")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3">
                    <span className="font-semibold text-[var(--ib-ink)]">
                      {t("contact.sat")}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {t("dynamic.dyn_1000AM4_41")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3">
                    <span className="font-semibold text-[var(--ib-ink)]">
                      {t("contact.sun")}
                    </span>
                    <span className="shrink-0 font-medium text-[var(--ib-mute)]">
                      {t("contact.closed")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          {...reveal(0.12)}
          className="mt-12 rounded-[20px] border border-[var(--ib-line)] bg-[var(--ib-card)] p-6 sm:mt-14 sm:p-8 lg:p-10"
        >
          <div className="max-w-[720px]">
            <div className="ib-eye">How we can help</div>
            <h2 className="mb-0! text-[26px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
              Talk to us about the full Assess → Apply journey
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ib-mute)] sm:text-base">
              Whether you need product guidance, partnership details, billing
              help, or a walkthrough of Mastery Lab, Library, Academy, or AI
              Assistant—send a message and we will route it to the right team.
              Most inquiries receive a first response within one business day.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HELP_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.title}
                  href={`/${lang}${topic.href}`}
                  className="group rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:shadow-[0_16px_36px_-24px_rgba(27,77,219,0.3)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-4 mb-0! text-[16px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ib-mute)]">
                    {topic.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ib-acc)] group-hover:gap-2">
                    Explore
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          {...reveal(0.18)}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            {
              title: "Sales & demos",
              body: "Book a walkthrough of Assess · Learn · Master · Apply for your team or consulting practice.",
            },
            {
              title: "Support & access",
              body: "Account access, plan changes, refunds, and technical issues with tools or course players.",
            },
            {
              title: "Partnerships",
              body: "Training partners, enterprise rollouts, and content collaboration opportunities.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 sm:p-6"
            >
              <h3 className="mb-0! text-[16px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]">
                {card.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ib-mute)]">
                {card.body}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
