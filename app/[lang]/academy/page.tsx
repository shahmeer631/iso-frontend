"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { ISOLearningSection } from '@/components/acadamy/ISOLearningSection';
import AcademyCategoriesNexus from '@/components/acadamy/AcademyCategoriesNexus';
import ComplianceBundles from '@/components/acadamy/ComplianceBundles';
import WhatYouGet from '@/components/acadamy/WhatYouGet';
import { Search, ChevronRight, PlayCircle, Brain, Award, GraduationCap, BookOpen, Cpu, ArrowRight, Loader2 } from "lucide-react";
import Image from 'next/image';
import { motion } from 'framer-motion';

import user1 from "@/public/user1.png";
import user2 from "@/public/user2.png";
import user3 from "@/public/user3.png";
import user4 from "@/public/user4.png";
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import OfferTimer from "@/components/landing-page-components/OfferTimer";

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";


const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

type User = {
  id: number;
  image: StaticImageData;
};

export const users: User[] = [
  { id: 2, image: user2 },
  { id: 1, image: user1 },
  { id: 3, image: user3 },
  { id: 4, image: user4 },
  { id: 5, image: user3 },
];

const AcademyPage = () => {
  const params = useParams();
  const lang = params?.lang || "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  // Sync i18n language with the URL [lang] param
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const storedEndTime = localStorage.getItem("offerEndTime");
    const TOTAL_MS = 24 * 60 * 60 * 1000;
    let endTime = storedEndTime ? Number(storedEndTime) : Date.now() + TOTAL_MS;

    if (isNaN(endTime) || endTime <= Date.now()) {
      endTime = Date.now() + TOTAL_MS;
      localStorage.setItem("offerEndTime", endTime.toString());
    }

    const updateTimer = () => {
      const now = Date.now();
      let distance = endTime - now;
      if (distance <= 0) {
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
        distance = TOTAL_MS;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const { data: response, isLoading: isPlansLoading } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const getUserId = () => {
    if (user?.id) return user.id;
    let currentToken = token;
    if (!currentToken && typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      if (match) currentToken = match[2];
    }
    if (currentToken) {
      const decoded = decodeJwt(currentToken);
      return decoded?.id || decoded?.userId || decoded?._id || null;
    }
    return null;
  };

  const currentUserId = getUserId();

  const plans = response?.data || [];
  const plan = plans.find(p => p.name?.toLowerCase().includes("pro")) || plans.find(p => p.name?.toLowerCase().includes("plus")) || plans[1];
  const isPurchased = user?.purchasedPlanIds?.some(id => id === plan?.id || id === plan?._id);

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      toast.success(t('academy.alreadyPurchased', 'You already have access to this plan.'));
      return;
    }
    if (!currentUserId) {
      router.push(`/${lang}/auth/login`);
      return;
    }
    const isFree = selectedPlan.discountedPrice === 0 || selectedPlan.name?.toLowerCase().includes("free");
    if (isFree) {
      router.push(`/${lang}/academy`);
      return;
    }
    const isAdmin = user?.role === "admin" || (token ? decodeJwt(token)?.role === "admin" : false);

    if (isAdmin) {
      toast.warning(t('pricingPage.adminWarning', 'Admin Account: Real payments are disabled for admin roles. Redirecting to Sandbox checkout...'), {
        description: t('pricingPage.adminWarningDesc', 'Admins are not allowed to make live transactions. Test credentials have been prefilled for your convenience.'),
        duration: 5000,
      });
      setTimeout(() => {
        const mockQueryParams = new URLSearchParams({
          clientSecret: "pi_mock_123_secret_mock_456",
          planName: selectedPlan.name,
          price: selectedPlan.discountedPrice.toString(),
          originalPrice: selectedPlan.originalPrice.toString(),
          isMock: "true",
          isAdminPayment: "true",
        }).toString();
        router.push(`/${lang}/payment?${mockQueryParams}`);
      }, 1500);
      return;
    }

    try {
      setProcessingPlanId(selectedPlan._id || selectedPlan.id);
      const courseId = searchParams.get("courseId") || undefined;
      const result = await createPaymentIntent({
        planId: selectedPlan.id,
        userId: currentUserId,
        courseId: courseId,
      }).unwrap();

      if (result.success) {
        const hostedUrl = (result.data as any)?.checkoutUrl || (result.data as any)?.sessionUrl || (result.data as any)?.url;
        if (hostedUrl && typeof hostedUrl === "string" && (hostedUrl.startsWith("http://") || hostedUrl.startsWith("https://"))) {
          window.location.href = hostedUrl;
          return;
        }

        if (result.data?.clientSecret) {
          const queryParams = new URLSearchParams({
            clientSecret: result.data.clientSecret,
            planId: selectedPlan.id || selectedPlan._id || "",
            planName: selectedPlan.name,
            price: selectedPlan.discountedPrice.toString(),
            originalPrice: selectedPlan.originalPrice.toString(),
            courseId: courseId ?? "",
          }).toString();
          router.push(`/${lang}/payment?${queryParams}`);
          return;
        }
      }
    } catch (error) {
      const err = error as { data?: { err?: { type?: string } }; status?: number; message?: string };
      console.error("Failed to create payment intent:", error);

      if (err?.status === 500) {
        toast.error(t('pricingPage.serverError', 'Internal Server Error: Could not initiate payment. Please try again later.'));
        return;
      }

      const isStripeError =
        err?.data?.err?.type?.includes("Stripe") ||
        JSON.stringify(err).includes("Stripe") ||
        JSON.stringify(error).includes("customer");

      if (isStripeError) {
        const confirmMock = window.confirm(t('pricingPage.stripeError', 'Stripe payment initiation failed. Do you want to proceed with a mock checkout?'));
        if (confirmMock) {
          const mockQueryParams = new URLSearchParams({
            clientSecret: "pi_mock_123_secret_mock_456",
            planName: selectedPlan.name,
            price: selectedPlan.discountedPrice.toString(),
            originalPrice: selectedPlan.originalPrice.toString(),
            isMock: "true",
          }).toString();
          router.push(`/${lang}/payment?${mockQueryParams}`);
        }
      } else {
        toast.error(t('pricingPage.paymentError', 'Failed to initiate payment. Please try again.'));
      }
    } finally {
      setProcessingPlanId(null);
    }
  };



  // const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div style={{ background: "#09090B", minHeight: "100vh", paddingTop: "60px" }}>
      {/* ── Pricing Hero Section ─────────────────────────── */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 overflow-hidden bg-[#09090B] bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[900px] pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-[#00f0ff]/5 rounded-full blur-[140px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* H1 & Subtitle */}


          {/* Typography-Based Premium Pricing Layout */}
          {!isPurchased && (
            <div className="max-w-7xl mx-auto px-4 py-8 font-inter text-gray-300">
              {/* Top Text & Pricing Summary */}
              <div className="text-center space-y-6 mb-16 flex flex-col">
                {/* 1. ISOBrain Pro (Most Popular) – USD $49/Month */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-black font-space-grotesk tracking-tight text-white"
                  >
                    {t('academy.isobrainProTitle')} <span className="text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]">{t('academy.isobrainProPrice')}</span>
                  </motion.div>
                )}

                {/* 2. Tagline Description 1 */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={
                    isPurchased
                      ? "text-2xl sm:text-3xl md:text-4xl font-black font-space-grotesk tracking-tight text-white max-w-4xl mx-auto leading-tight"
                      : "text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                  }
                >
                  {t('academy.popularTierDesc')}
                </motion.p>

                {/* 3. Designed for professionals... */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="text-gray-500 text-xs sm:text-sm italic max-w-xl mx-auto"
                >
                  {t('academy.designedForPros')}
                </motion.p>

                {/* 4. Countdown ticking—secure your spot! */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-[#00f0ff] text-xs font-black uppercase tracking-[0.2em] w-fit mx-auto"
                  >
                    {t('academy.countdownText')}
                  </motion.div>
                )}

                {/* 5. Master new skills for USD$ 49 */}
                {!isPurchased && (
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight font-space-grotesk"
                  >
                    {t('academy.masterSkills')}
                  </motion.h3>
                )}

                {/* 6. Get ISOBrain Pro & Start Learning */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <button
                      onClick={() => router.push(`/${lang}/pricing`)}
                      className="group relative inline-flex items-center justify-center gap-3 bg-[#00f0ff] text-[#0F111A] font-bold text-sm sm:text-base px-8 py-5 rounded-[12px] hover:bg-[#00f0ff]/95 transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_55px_rgba(0,240,255,0.45)] transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider cursor-pointer"
                    >
                      <span>{t('academy.getStartedBtn')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-[#0F111A]" />
                    </button>
                  </motion.div>
                )}

                {/* 7. Countdown Timer */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 }}
                    className="max-w-xl mx-auto my-6 relative group cursor-default"
                  >
                    <div className="relative bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/10 hover:border-[#00F0FF]/40 rounded-3xl py-6 px-10 sm:px-14 flex items-center justify-center gap-8 shadow-2xl transition-all duration-500 overflow-hidden mx-auto w-fit">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent blur-[2px]"></div>

                      <div className="flex items-center gap-3 sm:gap-4 md:gap-5 shrink-0 z-10">
                        {[
                          { label: t('academy.hours'), value: timeLeft.hours },
                          { label: t('academy.mins'), value: timeLeft.minutes },
                          { label: t('academy.secs'), value: timeLeft.seconds, isAccent: true }
                        ].map((time, index) => (
                          <Fragment key={index}>
                            <div className="flex flex-col items-center group/timer-item">
                              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-2xl shadow-inner transition-all duration-350 hover:-translate-y-1 ${time.isAccent
                                ? "bg-gradient-to-b from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                                : "bg-[#14141A] border border-gray-800 text-white"
                                }`}>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                                {time.value.toString().padStart(2, "0")}
                              </div>
                              <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 uppercase tracking-widest font-semibold ${time.isAccent ? "text-[#00F0FF]" : "text-gray-500"}`}>
                                {time.label}
                              </span>
                            </div>
                            {index < 2 && (
                              <span className="text-xl sm:text-2xl text-gray-700 font-bold -mt-5 animate-pulse">:</span>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* What you get details (Vertically stacked, centered typography grid) */}
              <div className="mt-20 border-t border-white/5 pt-16 max-w-7xl mx-auto text-center">
                <h4 className="text-xl sm:text-2xl font-black text-white font-space-grotesk uppercase tracking-wider mb-2">
                  {isPurchased ? t('academy.yourPlanBenefits') : t('academy.forUSDYouGet')}
                </h4>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-12 font-inter">
                  {t('academy.everythingInPlus')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {/* Benefit 1 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('academy.unlimitedAccessTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('academy.unlimitedAccessDesc')}
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('academy.highQualityTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('academy.highQualityDesc')}
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('academy.advancedStudyTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('academy.advancedStudyDesc')}
                    </p>
                  </div>

                  {/* Benefit 4 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('academy.unlimitedCPDTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('academy.unlimitedCPDDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {isPurchased && (
        <>
          {/* ── The Learning System ────────────────────────────── */}
          <section className="py-20 px-4 sm:px-6 bg-[#0B0C10] font-inter border-t border-[#232733]">
            <div className="max-w-7xl mx-auto text-center mb-16">
              <h2 className="text-[34px] font-semibold text-white leading-[1.3] mb-4">{t('academy.systemBuiltTitle')}</h2>
              <h3 className="text-[20px] sm:text-[24px] font-medium text-[#A0AEC0] leading-[1.4]">
                {t('academy.systemBuiltDesc')}
              </h3>
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: t('academy.expertLedTitle'), desc: t('academy.expertLedDesc'), icon: <PlayCircle size={32} className="text-[#00f0ff] mb-6" /> },
                { title: t('academy.aiSupportedTitle'), desc: t('academy.aiSupportedDesc'), icon: <Brain size={32} className="text-[#00f0ff] mb-6" /> },
                { title: t('academy.certPathTitle'), desc: t('academy.certPathDesc'), icon: <Award size={32} className="text-[#00f0ff] mb-6" /> }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#15171E] border border-[#232733] p-8 rounded-2xl flex flex-col text-left hover:border-[#00f0ff]/50 transition-colors">
                  {item.icon}
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-[#A0AEC0] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Smart Learning Features ────────────────────────────── */}
          <section className="py-20 px-4 sm:px-6 bg-[#0B0C10] font-inter border-t border-[#232733]">
            <div className="max-w-7xl mx-auto text-center mb-16">
              <h2 className="text-[34px] font-semibold text-white leading-[1.3] mb-4">{t('academy.aiPoweredTitle')}</h2>
              <h3 className="text-[20px] sm:text-[24px] font-medium text-[#A0AEC0] leading-[1.4] max-w-3xl mx-auto">
                {t('academy.aiPoweredDesc')}
              </h3>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: t('academy.studyGuideTitle'), desc: t('academy.studyGuideDesc'), icon: "📝" },
                { title: t('academy.briefingDocsTitle'), desc: t('academy.briefingDocsDesc'), icon: "📄" },
                { title: t('academy.analogiesTitle'), desc: t('academy.analogiesDesc'), icon: "💡" },
                { title: t('academy.smartNotesTitle'), desc: t('academy.smartNotesDesc'), icon: "✍️" }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#15171E] border border-[#232733] p-8 rounded-2xl flex items-start gap-6 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-shadow">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-[#A0AEC0] leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Dynamic Category Explorer ── */}
      <AcademyCategoriesNexus searchTerm={searchQuery} />

      {/* ── Tangible Career Outcomes ────────────────────────────── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#0B0C10] font-inter border-t border-[#232733]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#15171E] border border-[#232733] rounded-[40px] p-8 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <h2 className="text-[34px] font-semibold text-white leading-[1.3] mb-4">{t('academy.careerTransformTitle')}</h2>
              <h3 className="text-[20px] sm:text-[24px] font-medium text-[#A0AEC0] leading-[1.4] mb-12 max-w-3xl mx-auto">
                {t('academy.careerTransformDesc')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
                <div className="space-y-4">
                  <div className="bg-[#00f0ff]/10 w-14 h-14 flex items-center justify-center rounded-xl">
                    <Award className="text-[#00f0ff] w-7 h-7" />
                  </div>
                  <h4 className="text-white font-bold text-[18px]">{t('academy.resumeBoostingTitle')}</h4>
                  <p className="text-[#A0AEC0] text-sm leading-relaxed">{t('academy.resumeBoostingDesc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#00f0ff]/10 w-14 h-14 flex items-center justify-center rounded-xl">
                    <BookOpen className="text-[#00f0ff] w-7 h-7" />
                  </div>
                  <h4 className="text-white font-bold text-[18px]">{t('academy.focusedTitle')}</h4>
                  <p className="text-[#A0AEC0] text-sm leading-relaxed">{t('academy.focusedDesc')}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#00f0ff]/10 w-14 h-14 flex items-center justify-center rounded-xl">
                    <Cpu className="text-[#00f0ff] w-7 h-7" />
                  </div>
                  <h4 className="text-white font-bold text-[18px]">{t('academy.quizzesTitle')}</h4>
                  <p className="text-[#A0AEC0] text-sm leading-relaxed">{t('academy.quizzesDesc')}</p>
                </div>
              </div>

              <Link
                href={`/${lang}/mastery-lab`}
                className="inline-flex items-center justify-center bg-[#00f0ff] text-[#0F111A] font-bold text-[14px] uppercase tracking-wide px-8 py-5 rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                {t('academy.beginPath')} <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AcademyPage;