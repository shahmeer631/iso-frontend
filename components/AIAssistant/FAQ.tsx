"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FAQItem {
  question: string;
  answer: string;
  bullets?: string[];
}

const FAQ = ({ 
  faqData, 
  title, 
  subtitle 
}: { 
  faqData: FAQItem[]; 
  title?: string; 
  subtitle?: string; 
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#F8FAFF]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full mb-5"
            data-aos="fade-down"
            data-aos-duration="600"
          >
            {t('faq.badge')}
          </span>
          <h2
            className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#0F172A] mb-5 leading-[1.2] tracking-tight"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="100"
          >
            {title || (
              <>
                {t('aiAssistantHome.faqTitle')}{" "}
                <span className="bg-gradient-to-r from-brand-cyan to-[#7C3AED] bg-clip-text text-transparent">
                  {t('aiAssistantHome.faqHighlight')}
                </span>
              </>
            )}
          </h2>
          <p
            className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="200"
          >
            {subtitle || (
              <>
                {t('aiAssistantHome.faqSubtitle')}{" "}
                <a
                  href="#"
                  className="text-indigo-600 font-medium underline underline-offset-2 hover:text-indigo-800 transition-colors"
                >
                  {t('aiAssistantHome.faqLink')}
                </a>
              </>
            )}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay={`${index * 60}`}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  isOpen
                    ? "border-indigo-200 bg-white shadow-md shadow-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm",
                )}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-7 py-5 flex items-center justify-between gap-4"
                >
                  {/* Number badge + question */}
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                        isOpen
                          ? "bg-indigo-600 text-white scale-110"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-base md:text-lg font-semibold transition-colors leading-snug",
                        isOpen ? "text-[#0F172A]" : "text-slate-700",
                      )}
                    >
                      {item.question}
                    </span>
                  </div>

                  {/* Chevron icon */}
                  <ChevronDown
                    className={cn(
                      "shrink-0 w-5 h-5 text-slate-400 transition-all duration-300",
                      isOpen && "rotate-180 text-indigo-600",
                    )}
                  />
                </button>

                {/* Answer panel */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="px-7 pb-6 pl-[4.75rem]">
                    {/* Left accent bar */}
                    <div className="border-l-2 border-indigo-200 pl-4">
                      <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                        {item.answer}
                      </p>

                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="mt-3 space-y-2.5">
                          {item.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-slate-500 text-sm md:text-base"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
