"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const PricingFAQ = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
  ];

  return (
    <section className="relative overflow-x-clip bg-[var(--ib-bg)] px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_6%,transparent)] blur-[120px]"
      />

      <div className="relative z-[1] mx-auto max-w-4xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease }}
          className="mb-10 text-center md:mb-14"
        >
          <div className="ib-eye mx-auto mb-3 inline-flex items-center gap-2">
            <HelpCircle className="size-3.5" aria-hidden />
            {t("faq.badge")}
          </div>
          <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px] lg:text-[38px]">
            {t("dynamic.dyn_fAQS_67")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] font-medium leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
            {t("faq.subtitle")}
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))] sm:px-7"
            >
              <AccordionTrigger className="py-5 text-left text-[15px] font-bold text-[var(--ib-ink)] transition-colors hover:text-[var(--ib-acc)] hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:py-6 sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-[14px] font-medium leading-relaxed text-[var(--ib-mute)] sm:pb-7 sm:text-[15px]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default PricingFAQ;
