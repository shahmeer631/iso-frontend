"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import user1 from "@/public/user1.png";
import user2 from "@/public/user2.png";
import user3 from "@/public/user3.png";
import user4 from "@/public/user4.png";
import { useParams, useRouter } from "next/navigation";
import { Typewriter } from "react-simple-typewriter";
import AOS from "aos";
import "aos/dist/aos.css";
import { ArrowRight, Play, CheckCircle2, ShieldCheck } from "lucide-react";
import AISimulation from "./AISimulation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

export interface HeroSectionProps {
  title?: string;
  description?: string;
  stats?: string;
}

export const users = [
  { id: 1, image: user1 },
  { id: 2, image: user2 },
  { id: 3, image: user3 },
  { id: 4, image: user4 },
];

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  displayedContent?: string;
  isStreaming?: boolean;
}

export default function HeroSection({
  description,
}: HeroSectionProps) {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const typewriterWords = t("hero.typewriterWords", { returnObjects: true }) as string[];

  return (
    <section className="relative bg-[#0F111A] overflow-visible pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Premium Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px]bg-[#00f0ff] text-[#0F111A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#B026FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Top Badge */}
          <div data-aos="fade-down" className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-8 max-w-full">
            <span className="flex h-2 w-2 rounded-full  bg-[#00f0ff] animate-pulse shrink-0" />
            <span className="text-[#00f0ff] text-[10px] sm:text-xs font-light tracking-widest uppercase font-inter whitespace-nowrap overflow-hidden text-ellipsis">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h2 className="space-grotesk text-lg   font-thin text-white leading-[1.1] mb-8" data-aos="fade-up">{t("hero.heading1")}
            {" "} <br />
            <span className="text-[#00f0ff]">
              <Typewriter
                words={typewriterWords}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={80}
                deleteSpeed={50}
                delaySpeed={2000}
              />
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-[#A1A1A6] text-sm lg:text-base max-w-4xl mx-auto leading-relaxed mb-12 font-inter" data-aos="fade-up" data-aos-delay="100">{t("hero.description")}</p>

          {/* Primary Hero CTA button */}
          <div className="mb-10 flex flex-col items-center gap-3" data-aos="fade-up" data-aos-delay="150">
            <Link href={`/${lang}/pricing`}>
              <Button className="bg-[#00f0ff] hover:bg-[#00f0ff] text-black font-bold px-8 py-6 rounded-full text-base sm:text-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 border-none">
                Get Started Now →
              </Button>
            </Link>
            <p className="text-xs text-gray-500 font-medium">
              Cancel anytime in 2 clicks.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
