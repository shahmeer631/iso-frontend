
"use client";

import { PlayCircle, Brain, Target, BookOpen, Lightbulb, FileText, CheckSquare, Presentation } from "lucide-react";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import Link from 'next/link';
import { useParams } from 'next/navigation';

export const ISOLearningSection = () => {
  const { t } = useTranslation();
  const params = useParams();
  const lang = params?.lang || 'en';

  return (
    <>
      <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "var(--ib-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px]" style={{ fontWeight: 700, color: "var(--ib-ink)", marginBottom: 16 }}>
              {t('academy.learningSystemTitle')}
            </h2>
            <p className="text-base sm:text-2xl" style={{ color: "var(--ib-mute)", maxWidth: 600, margin: "0 auto" }}>
              {t('academy.learningSystemSubtitle')}
            </p>
            <p className="text-xs sm:text-base" style={{ color: "var(--ib-mute)", maxWidth: 800, margin: "16px auto 0" }}>
              {t('academy.learningSystemDesc')}
            </p>
            <Link
              href={`/${lang}/library/iso-standards`}
              className="mt-8 block w-fit mx-auto text-decoration-none"
            >
              <button
                className="bg-[var(--ib-acc)] text-white px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap border-none"
              >
                {t('academy.viewBusinessStandards')}
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Video-based Courses */}
            <div style={{
              background: "var(--ib-card)", borderRadius: 24, padding: 32,
              border: "1px solid var(--ib-line)", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--ib-acc)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <PlayCircle size={32} color="#fff" />
              </div>
              <h3 className="font-inter" style={{ fontSize: 24, fontWeight: 600, color: "var(--ib-ink)", marginBottom: 16 }}>{t('academy.videoLearning')}</h3>
              <p style={{ color: "var(--ib-mute)", fontSize: 15, lineHeight: 1.6 }}>
                {t('academy.videoLearningDesc')}
              </p>
            </div>

            {/* AI-powered Tools */}
            <div style={{
              background: "var(--ib-card)", borderRadius: 24, padding: 32,
              border: "1px solid var(--ib-line)", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center",
              position: "relative", overflow: "hidden"
            }}>
              {/* Highlight Glow */}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% -20%, var(--ib-accbg), transparent 70%)", pointerEvents: "none" }} />

              <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--ib-acc)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, zIndex: 1 }}>
                <Brain size={32} color="#fff" />
              </div>
              <h3 className="font-inter" style={{ fontSize: 24, fontWeight: 600, color: "var(--ib-ink)", marginBottom: 16, zIndex: 1 }}>{t('academy.aiTools')}</h3>
              <p style={{ color: "var(--ib-mute)", fontSize: 15, lineHeight: 1.6, zIndex: 1 }}>
                {t('academy.aiToolsDesc')}
              </p>
            </div>

            {/* Certification Pathway */}
            <div style={{
              background: "var(--ib-card)", borderRadius: 24, padding: 32,
              border: "1px solid var(--ib-line)", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--ib-acc)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Target size={32} color="#fff" />
              </div>
              <h3 className="font-inter" style={{ fontSize: 24, fontWeight: 600, color: "var(--ib-ink)", marginBottom: 16 }}>{t('academy.pathway')}</h3>
              <p style={{ color: "var(--ib-mute)", fontSize: 15, lineHeight: 1.6 }}>
                {t('academy.pathwayDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section style={{ background: "var(--ib-bg)", padding: "80px 24px", borderTop: "1px solid var(--ib-line)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="font-sans" style={{ fontSize: "42px", fontWeight: 700, color: "var(--ib-ink)" }}>
              {t('academy.smartLearning')}
            </h2>
            <h2 className="font-sans" style={{ fontSize: "42px", fontWeight: 700, color: "var(--ib-ink)" }}>
              {t('academy.learnFaster')}
            </h2>
            <p className="text-sm font-inter text-[var(--ib-mute)]">
              {t('academy.everyLessonSupported')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t('academy.studyGuide'), desc: t('academy.studyGuideDesc'), icon: BookOpen, color: "var(--ib-acc)" },
              { title: t('academy.briefingDoc'), desc: t('academy.briefingDocDesc'), icon: FileText, color: "var(--ib-acc)" },
              { title: t('academy.smartNotes'), desc: t('academy.smartNotesDesc'), icon: CheckSquare, color: "var(--ib-ok)" },
              { title: t('academy.analogies'), desc: t('academy.analogiesDesc'), icon: Lightbulb, color: "var(--ib-acc)" }
            ].map((tool, i) => (
              <div key={i} style={{
                background: "var(--ib-card)", borderRadius: 20, padding: 24,
                border: "1px solid var(--ib-line)", display: "flex", alignItems: "center", gap: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--ib-accbg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <tool.icon size={24} color={tool.color} />
                </div>
                <div>
                  <h3 className="font-inter" style={{ fontSize: 16, fontWeight: 600, color: "var(--ib-ink)", marginBottom: 4 }}>
                    {tool.title}
                  </h3>
                  <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.4 }}>
                    {tool.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
