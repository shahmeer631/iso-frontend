"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface Review {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
}



const ReviewCard = ({ review }: { review: Review }) => (
  <div className="shrink-0 w-[240px] sm:w-[450px] p-4 sm:p-8 mx-2 sm:mx-4 bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-2xl sm:rounded-[32px] shadow-2xl relative group">
    <Quote className="absolute top-3 right-5 text-[var(--ib-acc)]/20 group-hover:text-[var(--ib-acc)]/10 transition-colors w-8 h-8 sm:w-16 sm:h-16" />
    <div className="flex flex-col gap-3 sm:gap-6 relative z-10">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            fill="var(--ib-acc)"
            className="text-[var(--ib-acc)] w-3 h-3 sm:w-4 sm:h-4"
          />
        ))}
      </div>
      <p className="text-[var(--ib-mute)] text-xs sm:text-lg leading-relaxed font-inter italic whitespace-normal">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--ib-acc)]/20 overflow-hidden shrink-0">
          <Image
            src={review.avatar}
            alt={review.name}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-bold text-[var(--ib-ink)] text-xs sm:text-base ">{review.name}</h4>
          <p className="text-[var(--ib-acc)] font-bold tracking-wider uppercase text-[8px] sm:text-[10px]">{review.role}</p>
        </div>
      </div>
    </div>
  </div>
);

const ReviewSection = ({ hideCTA = false, className = "py-10 lg:py-32 bg-[var(--ib-bg)] border-t border-[var(--ib-line)]" }: { hideCTA?: boolean, className?: string }) => {
  const { t } = useTranslation();
  const reviewsData = t('review.reviews', { returnObjects: true }) as any[];

  return (
    <section className={`${className} overflow-hidden`}>
      <div className="container mx-auto px-4 text-center mb-20">
        <h2 className="text-4xl lg:text-[42px] font-semibold text-[var(--ib-ink)] leading-[1.1] tracking-tight mb-8">
          {t('review.trustBadge')}
          <span className="text-[var(--ib-acc)]"> {t('review.trustBadgeHighlight')}</span>
        </h2>
        <h3 className="text-[var(--ib-mute)] text-xl md:text-2.5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">{t('review.trustSubtitle')}</h3>
        <p className="text-[var(--ib-mute)] text-lg font-inter max-w-4xl mx-auto leading-relaxed">{t('review.trustDesc')}</p>
      </div>

      {/* Marquee Row */}
      <div className="relative flex overflow-hidden group">
        <div className="flex animate-marquee-left py-10">
          {[...reviewsData, ...reviewsData, ...reviewsData, ...reviewsData].map((review, idx) => (
            <ReviewCard key={`row1-${idx}`} review={{ ...review, avatar: `/user${(idx % 4) + 1}.png`, rating: 5 }} />
          ))}
        </div>

        {/* Gradient Fades */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[var(--ib-bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[var(--ib-bg)] to-transparent z-10 pointer-events-none" />
      </div>

      {/* CTA Section below reviews */}
      {!hideCTA && (
        <div className="container mx-auto px-4 mt-24">
          <div className="max-w-4xl mx-auto bg-[#2563EB]/10 border border-[var(--ib-line)] rounded-3xl sm:rounded-[40px] p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="text-2xl sm:text-3xl font-bold text-[var(--ib-acc)] mb-6 relative z-10">
              {t('review.readyStand')} {" "}<span >{t('review.readyStandHighlight')}</span>
            </div>
            <p className="text-[var(--ib-mute)] text-sm sm:text-lg font-inter mb-8 relative z-10 max-w-2xl mx-auto">{t('review.readyStandDesc')}</p>
            <Link href="/mastery-lab">
              <button className="relative z-10 bg-[var(--ib-acc)] text-white font-bold px-6 py-3 sm:px-10 sm:py-4 rounded-full text-xs sm:text-base hover:scale-105 transition-transform cursor-pointer whitespace-nowrap">
                {t('review.startFreeAssessment')}
              </button>
            </Link>
            {/* Background Glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-[100px]" />
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
