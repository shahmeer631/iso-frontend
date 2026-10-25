"use client";

import { ArrowRight, Brain, GraduationCap, Microscope, Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import AOS from "aos";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

export default function ISOPlatform() {
  const params = useParams();
  const lang = params?.lang || "en";
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const featureCards = [
    {
      id: "ai-assistant",
      title: t('platform.aiAssistant.title'),
      icon: <Brain className="text-[var(--ib-acc)]" size={24} />,
      iconBg: "bg-[#2563EB]/10",
      iconBorder: "border-[#2563EB]/20",
      description: t('platform.aiAssistant.description'),
      image: "/ai-assistant.png",
      link: `/${lang}/ai-assistant-home`,
      btnText: t('platform.aiAssistant.btn', 'Explore AI Assistant'),
      btnColor: "text-[var(--ib-acc)]",
      glowColor: "bg-[#2563EB]/5",
      reverse: false,
    },
    {
      id: "academy",
      title: t('platform.academy.title'),
      icon: <GraduationCap className="text-[var(--ib-acc)]" size={24} />,
      iconBg: "bg-[#2563EB]/10",
      iconBorder: "border-[#2563EB]/20",
      description: t('platform.academy.description'),
      image: "/academy.png",
      link: `/${lang}/academy`,
      btnText: t('platform.academy.btn', 'Explore Academy Courses'),
      btnColor: "text-[var(--ib-acc)]",
      glowColor: "bg-[#2563EB]/5",
      reverse: true,
    },
    {
      id: "assessment",
      title: t('platform.masteryLab.title'),
      icon: <Microscope className="text-[var(--ib-acc)]" size={24} />,
      iconBg: "bg-[#2563EB]/10",
      iconBorder: "border-[#2563EB]/20",
      description: t('platform.masteryLab.description'),
      image: "/mastery-lab.png",
      link: `/${lang}/mastery-lab`,
      btnText: t('platform.masteryLab.btn', 'Test Your Knowledge'),
      btnColor: "text-[var(--ib-acc)]",
      glowColor: "bg-[#2563EB]/5",
      reverse: false,
    },
    {
      id: "library",
      title: t('platform.library.title'),
      icon: <Library className="text-[var(--ib-acc)]" size={24} />,
      iconBg: "bg-[#2563EB]/10",
      iconBorder: "border-[#2563EB]/20",
      description: t('platform.library.description'),
      image: "/library.png",
      link: `/${lang}/library/iso-standards`,
      btnText: t('platform.library.btn', 'Explore ISO Standards'),
      btnColor: "text-[var(--ib-acc)]",
      glowColor: "bg-[#2563EB]/5",
      reverse: true,
    },
  ];

  return (
    <section id="platform" className="bg-[var(--ib-bg)] py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-24" data-aos="fade-up">
          <h2 className="text-4xl lg:text-[42px] font-semibold text-[var(--ib-ink)] leading-[1.2] tracking-tight mb-6">
            {t('platform.heading1')}{" "}
            <span className="text-[var(--ib-acc)]">{t('platform.headingHighlightText')}</span>
          </h2>
          <p className="text-[var(--ib-mute)] text-base max-w-3xl mx-auto font-inter mb-10 leading-relaxed">{t('platform.description')}</p>
          <Link href={`/${lang}/mastery-lab`}>
            <button className="bg-[var(--ib-acc)] text-white border border-[var(--ib-acc)] px-8 py-3 rounded-[10px] font-semibold transition-all mb-16 cursor-pointer hover:opacity-92">{t('platform.moreAboutUs')}</button>
          </Link>
        </div>

        {/* Feature Rows */}
        <div className="flex flex-col gap-12 lg:gap-20 max-w-7xl mx-auto">
          {featureCards.map((card) => (
            <div
              key={card.id}
              className="bg-[var(--ib-card)] rounded-3xl p-8 lg:p-16 border border-[var(--ib-line)] relative overflow-hidden group shadow-[0_24px_60px_-24px_rgba(11,18,32,0.18)]"
              data-aos={card.reverse ? "fade-left" : "fade-right"}
            >
              <div
                className={`relative z-10 flex flex-col ${card.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                  } gap-12 lg:gap-20 items-center`}
              >
                <div className="lg:w-1/2 space-y-8">
                  <div
                    className={`w-14 h-14 mx-auto lg:mx-auto rounded-2xl ${card.iconBg} flex items-center justify-center border ${card.iconBorder}`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-medium text-[var(--ib-ink)] tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[var(--ib-mute)] text-lg leading-relaxed font-inter text-justify break-words">
                    {card.description}
                  </p>
                  <Link
                    href={card.link}
                    className={`inline-flex items-center gap-3 ${card.btnColor} font-medium text-sm lg:text-base group/btn cursor-pointer `}
                  >
                    {card.btnText}{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
                <div className="lg:w-1/2 relative w-full">
                  <div className="relative rounded-2xl overflow-hidden border border-[var(--ib-line)] shadow-[0_24px_60px_-24px_rgba(11,18,32,0.25)] transform transition-transform duration-700 group-hover:scale-[1.02]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={600}
                      height={450}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Decorative Glow */}
              <div
                className={`absolute ${card.reverse ? "top-0 left-0" : "bottom-0 right-0"
                  } w-96 h-96 ${card.glowColor} rounded-full blur-[120px] pointer-events-none`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
