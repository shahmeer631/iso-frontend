"use client";

import React from "react";
import FeatureCard from "../mastery-lab/evaluation/FeatureCard";
import { BookOpen, Bot, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const ExploreFeatures = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const featuresData = [
    {
      id: "platform",
      title: t("mastery.card1Title"),
      description: t("mastery.card1Desc"),
      cta: t("mastery.card1Cta"),
      href: "/library/iso-standards",
      icon: BookOpen,
      iconBgColor: "var(--ib-accbg)",
      iconColor: "var(--ib-acc)",
    },
    {
      id: "ai-assistant",
      title: t("mastery.card2Title"),
      description: t("mastery.card2Desc"),
      cta: t("mastery.card2Cta"),
      href: "/ai-assistant-home",
      icon: Bot,
      iconBgColor: "var(--ib-accbg)",
      iconColor: "var(--ib-acc)",
    },
    {
      id: "courses",
      title: t("mastery.card3Title"),
      description: t("mastery.card3Desc"),
      cta: t("mastery.card3Cta"),
      href: "/academy",
      icon: GraduationCap,
      iconBgColor: "rgba(217, 119, 6, 0.12)",
      iconColor: "#D97706",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1152px]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, ease }}
        className="mb-10 text-center md:mb-12"
      >
        <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px]">
          {t("mastery.nextStepsTitle")}
        </h2>
        <p className="mt-2 text-[15px] text-[var(--ib-mute)] sm:text-[16px]">
          {t("mastery.nextStepSubtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {featuresData.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.4,
              delay: reduceMotion ? 0 : index * 0.06,
              ease,
            }}
          >
            <FeatureCard
              title={feature.title}
              description={feature.description}
              cta={feature.cta}
              href={feature.href}
              icon={feature.icon}
              iconBgColor={feature.iconBgColor}
              iconColor={feature.iconColor}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExploreFeatures;
