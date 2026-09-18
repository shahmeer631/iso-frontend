import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const PricingFAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4'),
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5'),
    },
    {
      question: t('faq.q6'),
      answer: t('faq.a6'),
    },
    {
      question: t('faq.q7'),
      answer: t('faq.a7'),
    },
  ];
  return (
    <section className=" bg-[#0A0A0C] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">

          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-white leading-[1.2] tracking-tight">
            {t('dynamic.dyn_fAQS_67')}</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/5 bg-[#141416]/50 rounded-3xl px-8 py-2 overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <AccordionTrigger className="text-left py-6 text-base font-bold text-gray-200 hover:text-white transition-colors hover:no-underline font-plus-jakarta">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 text-[15px] leading-relaxed pb-8 font-medium">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
