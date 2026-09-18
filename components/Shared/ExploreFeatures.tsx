"use client";
import React from 'react'
import FeatureCard from '../mastery-lab/evaluation/FeatureCard'
import { BookOpen, Bot, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const ExploreFeatures = () => {
  const { t } = useTranslation();

  const featuresData = [
    {
      id: "platform",
      title: t('mastery.card1Title'),
      description: t('mastery.card1Desc'),
      cta: t('mastery.card1Cta'),
      href: "/library/iso-standards",
      icon: BookOpen,
      iconBgColor: "rgba(0, 240, 255, 0.1)",
      iconColor: "#00F0FF",
    },
    {
      id: "ai-assistant",
      title: t('mastery.card2Title'),
      description: t('mastery.card2Desc'),
      cta: t('mastery.card2Cta'),
      href: "/ai-assistant-home",
      icon: Bot,
      iconBgColor: "rgba(176, 38, 255, 0.1)",
      iconColor: "#B026FF",
    },
    {
      id: "courses",
      title: t('mastery.card3Title'),
      description: t('mastery.card3Desc'),
      cta: t('mastery.card3Cta'),
      href: "/academy",
      icon: GraduationCap,
      iconBgColor: "rgba(255, 184, 0, 0.1)",
      iconColor: "#FFB800",
    },
  ];

  return (
    <div className="w-full max-w-[1152px] mx-auto mt-10 mb-4 px-0 sm:px-4">
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 className="space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white mb-2">
          {t('mastery.nextStepsTitle')}</h2>
        <p style={{ color: "#A0AAB2", fontSize: 16 }}>
          {t('mastery.nextStepSubtitle')}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 32 }}>
        {featuresData.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            cta={feature.cta}
            href={feature.href}
            icon={feature.icon}
            iconBgColor={feature.iconBgColor}
            iconColor={feature.iconColor}
          />
        ))}
      </div>
    </div>
  )
}

export default ExploreFeatures