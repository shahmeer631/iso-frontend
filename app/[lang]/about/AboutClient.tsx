"use client";

import { CheckCircle2, Shield, GraduationCap, Zap, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import AISimulation from "@/components/landing-page-components/AISimulation";
import Link from "next/link";

export default function AboutClient() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0F111A] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-brand-cyan  border border-brand-cyan/20 text-[#00f0ff] text-sm font-medium mb-8">
              <span>{t('aboutPage.badge')}</span>
            </div>
            <h1 className="space-grotesk text-3xl sm:text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight mb-6 sm:mb-8">
              {t('aboutPage.heroHeading')}
            </h1>
            <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto font-inter leading-relaxed mb-8 sm:mb-12">{t('aboutPage.description')}</p>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.05)_0%,_transparent_70%)] pointer-events-none" />
      </section>

      {/* The Problem Section */}
      <section className="py-12 sm:py-4 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-semibold text-brand-cyan leading-[1.2] tracking-tight">
                {t('aboutPage.problemTitle')}
              </h2>
              <p className="text-[#A1A1A6] text-sm lg:text-lg leading-relaxed font-inter">
                {t('aboutPage.problemText')}
              </p>

              <Link href="/library/iso-standards" className="inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 bg-[#00f0ff] text-[#0F111A]  font-bold rounded-2xl hover:scale-105 transition-all text-sm sm:text-base active:scale-95 border-none">{t('aboutPage.cta')}</Link>
            </div>
            <div className="relative">
              <div className="relative group rotate-x-2 transition-transform duration-700 hover:rotate-x-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-violet-600/20 rounded-2xl blur-2xl group-hover:opacity-100 transition-opacity" />
                <AISimulation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Ecosystem Section */}
      <section className="py-12 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-[1.2] tracking-tight mb-6">
              {t('aboutPage.systemHeading')}
            </h2>
            <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-2xl mx-auto font-inter">
              {t('aboutPage.systemSubheading')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: t('aboutPage.assessmentTitle'), text: t('aboutPage.assessment'), icon: <Target className="text-[#00f0ff]" />, bg: "bg-[#00f0ff]/10" },
              { title: t('aboutPage.learningTitle'), text: t('aboutPage.learning'), icon: <GraduationCap className="text-[#B026FF]" />, bg: "bg-[#B026FF]/10" },
              { title: t('aboutPage.guidanceTitle'), text: t('aboutPage.guidance'), icon: <Zap className="text-[#FFB800]" />, bg: "bg-[#FFB800]/10" },
              { title: t('aboutPage.applicationTitle'), text: t('aboutPage.application'), icon: <Shield className="text-[#00f0ff]" />, bg: "bg-[#00f0ff]/10" }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[32px] bg-[#1E212B] border border-white/5 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.bg}`}>
                  {item.icon}
                </div>
                <h3 className="space-grotesk text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-[#A1A1A6] font-inter">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-12 sm:py-24 bg-[#1E212B]/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto text-center space-y-6">
            <h2 className="space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-[1.2] tracking-tight">
              {t('aboutPage.whoTitle')}
            </h2>
            <p className="text-[#A1A1A6] text-sm lg:text-lg leading-relaxed font-inter max-w-4xl mx-auto">
              {t('aboutPage.whoSubtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl lg:max-w-full mx-auto mt-6 text-left">
              {(t('aboutPage.whoItems', { returnObjects: true }) as string[]).map((item, i) => (
                <div key={i} className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:border-brand-cyan/40 transition-colors">
                  <CheckCircle2 size={18} className="text-brand-cyan shrink-0" />
                  <span className="font-medium text-sm sm:text-base lg:whitespace-nowrap">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm lg:text-lg font-medium text-white/80 font-inter pt-4">
              {t('aboutPage.whoFinal')}
            </p>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-12 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto rounded-[48px] bg-gradient-to-br from-[#1E212B] to-[#0F111A] p-8 md:p-20 border border-white/5 relative overflow-hidden">
            <div className="relative z-10 text-center space-y-8 sm:space-y-10">
              <h2 className="space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white leading-[1.2] tracking-tight">{t('aboutPage.approachTitle')}</h2>
              <p className="text-[#A1A1A6] text-sm lg:text-lg leading-relaxed max-w-3xl mx-auto font-inter">
                {t('aboutPage.approachText')}
              </p>
              <Link href="/library/iso-standards" className="inline-flex items-center justify-center px-6 py-3.5 sm:px-10 sm:py-5 bg-[#00f0ff] text-[#0F111A] font-bold rounded-2xl  text-sm sm:text-base mx-auto active:scale-95 border-none">{t('pricingPage.startAssessment')}</Link>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64bg-[#00f0ff] text-[#0F111A]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B026FF]/10 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
