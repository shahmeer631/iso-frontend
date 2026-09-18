"use client";

import { BookOpen, BrainCircuit, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function WhatYouGet() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = params?.lang || 'en';

  const benefits = [
    {
      icon: BookOpen,
      title: t('academy.lessonsPerCourse'),
      description: t('academy.lessonsDesc'),
      color: "#00F0FF",
      bg: "rgba(0,240,255,0.1)",
    },
    {
      icon: BrainCircuit,
      title: t('academy.aiQuizzes'),
      description: t('academy.aiQuizzesDesc'),
      color: "#00F0FF",
      bg: "rgba(212,175,55,0.1)",
    },
    {
      icon: Award,
      title: t('academy.recognizedCert'),
      description: t('academy.certDesc'),
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
    },
  ];

  return (
    <section style={{ background: "#0B0F19", padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 className="space-grotesk" style={{ fontSize: "42px", fontWeight: 700, color: "#FFFFFF", marginBottom: 16 }}>
            {t('academy.outcomeTitle')}
          </h2>
          <p style={{ color: "#A0AAB2", fontSize: 18, maxWidth: 800, margin: "0 auto" }}>
            {t('academy.outcomeDescription')}
          </p>

          <button style={{
            background: "#00F0FF", color: "#0F111A", padding: "12px 24px",
            borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
            border: "none", display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s"
          }}
            className='mt-3 mb-3 mx-auto mt-8'
          >
            <Link
              href={`/${lang}/mastery-lab`}

            >{t('pricingPage.startAssessment')}</Link>

          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 24, padding: 40,
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
              }}
            >
              <div style={{
                height: 80, width: 80, borderRadius: "50%", background: benefit.bg,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
                border: `1px solid ${benefit.bg.replace('0.1', '0.2')}`
              }}>
                <benefit.icon size={32} color={benefit.color} />
              </div>

              <h3 className="font-inter" style={{ fontSize: 24, fontWeight: 600, color: "#ffffff", marginBottom: 16 }}>
                {benefit.title}
              </h3>

              <p style={{ color: "#A0AAB2", fontSize: 15, lineHeight: 1.6 }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}