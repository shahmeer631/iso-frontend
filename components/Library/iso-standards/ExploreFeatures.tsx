"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Library, Bot, GraduationCap, ArrowRight } from "lucide-react";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const ExploreFeatures = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t('mastery.card1Title'),
      description: t('mastery.card1Desc'),
      linkText: t('mastery.card1Cta'),
      linkHref: `/${t('lang')}/library`,
      icon: Library,
    },
    {
      title: t('mastery.card2Title'),
      description: t('mastery.card2Desc'),
      linkText: t('mastery.card2Cta'),
      linkHref: `/${t('lang')}/ai-assistant-home`,
      icon: Bot,
    },
    {
      title: t('mastery.card3Title'),
      description: t('mastery.card3Desc'),
      linkText: t('mastery.card3Cta'),
      linkHref: `/${t('lang')}/academy`,
      icon: GraduationCap,
    },
  ];

  return (
    <section className="relative w-full py-24 overflow-hidden">
      {/* Responsive Background Layer */}
      <div className="absolute inset-0 z-0 bg-no-repeat w-full h-full opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-[#1E293B] mb-4 leading-[1.2] tracking-tight">
            {t('mastery.exploreMore')}
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            {t('mastery.nextStepSubtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                transition: { duration: 0.2 },
              }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-start transition-all"
            >
              <div className="bg-[#EEF2FF] p-3 rounded-xl mb-6 text-brand-cyan">
                <feature.icon size={26} />
              </div>

              <h3 className="text-xl font-bold text-[#1E293B] mb-3">
                {feature.title}
              </h3>

              <p className="text-[#64748B] text-base leading-relaxed mb-8">
                {feature.description}
              </p>

              <Link
                href={feature.linkHref}
                className="mt-auto text-brand-cyan font-semibold flex items-center gap-2 group hover:gap-3 transition-all"
              >
                {feature.linkText}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreFeatures;
