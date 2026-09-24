"use client";

import FAQ from "@/components/AIAssistant/FAQ";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  BarChart3,
  Globe,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AISimulation from "@/components/landing-page-components/AISimulation";
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import OfferTimer from "@/components/landing-page-components/OfferTimer";
import { Loader2 } from "lucide-react";
import { userHasFeature, userOwnsPlanId } from "@/lib/access/effectiveAccess";

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import ReviewSection from "@/components/AIAssistant/ReviewSection";


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

// --- Types ---
interface FAQItem {
  question: string;
  answer: string;
  bullets?: string[];
}

// --- Sub-Components ---

const PromptPills = ({ onClick }: { onClick: (p: string) => void }) => {
  const { t } = useTranslation();

  const prompts = [
    { label: t('aiAssistantHome.promptQuality'), value: "Quality (9001) Courses" },
    { label: t('aiAssistantHome.promptSecurity'), value: "Security (27001) Courses" },
    { label: t('aiAssistantHome.promptEnvironmental'), value: "Environmental (14001) Courses" },
    { label: t('aiAssistantHome.promptHealth'), value: "Health & Safety Courses" },
    { label: t('aiAssistantHome.promptInfoSec'), value: "Information Security Policy" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {prompts.map((prompt, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          onClick={() => onClick(prompt.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
        >
          {prompt.label}
        </motion.button>
      ))}
    </div>
  );
};

// --- Main Page Component ---

const AIAssistantHome = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
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
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const plan = plans.find(p => p.name?.toLowerCase().includes("ultra") || p.name?.toLowerCase().includes("enterprise")) || plans[2];
  // Subscription purchase OR User Group grant (Ultra via AI_ASSISTANT feature)
  const isPurchased =
    userOwnsPlanId(user, plan?.id || plan?._id) || userHasFeature(user, "AI_ASSISTANT");

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      toast.success(t('aiAssistantHome.alreadyPurchased', 'You already have access to this plan.'));
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

      if (result.success && result.data?.clientSecret) {
        const queryParams = new URLSearchParams({
          clientSecret: result.data.clientSecret,
          planId: selectedPlan.id || selectedPlan._id || "",
          planName: selectedPlan.name,
          price: selectedPlan.discountedPrice.toString(),
          originalPrice: selectedPlan.originalPrice.toString(),
          courseId: courseId ?? "",
        }).toString();
        router.push(`/${lang}/payment?${queryParams}`);
      } else if (result.success && (result.data as any)?.url) {
        window.location.href = (result.data as any).url;
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

  const faqData: FAQItem[] = [
    {
      question: t('aiAssistantHome.faqs.q1'),
      answer: t('aiAssistantHome.faqs.a1'),
    },
    {
      question: t('aiAssistantHome.faqs.q2'),
      answer: t('aiAssistantHome.faqs.a2'),
    },
    {
      question: t('aiAssistantHome.faqs.q3'),
      answer: t('aiAssistantHome.faqs.a3'),
    },
    {
      question: t('aiAssistantHome.faqs.q4'),
      answer: t('aiAssistantHome.faqs.a4'),
    },
    {
      question: t('aiAssistantHome.faqs.q5'),
      answer: t('aiAssistantHome.faqs.a5'),
    },
    {
      question: t('aiAssistantHome.faqs.q6'),
      answer: t('aiAssistantHome.faqs.a6'),
    },
  ];


  const handleSearch = (e: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || searchQuery).trim();
    if (query) {
      const lowerQuery = query.toLowerCase();

      // Smart Routing Logic
      if (lowerQuery.includes("course") || lowerQuery.includes("academy")) {
        if (lowerQuery.includes("quality")) router.push(`/${lang}/academy?category=Quality`);
        else if (lowerQuery.includes("security")) router.push(`/${lang}/academy?category=Security`);
        else if (lowerQuery.includes("environmental")) router.push(`/${lang}/academy?category=Environmental`);
        else if (lowerQuery.includes("health")) router.push(`/${lang}/academy?category=Health`);
        else router.push(`/${lang}/academy`);
      }
      else if (lowerQuery.includes("audit") || lowerQuery.includes("lens")) {
        router.push(`/${lang}/ai-assistant/audit-lens`);
      }
      else if (lowerQuery.includes("navigator") || lowerQuery.includes("map")) {
        router.push(`/${lang}/ai-assistant/iso-navigator`);
      }
      else if (lowerQuery.includes("benchmark") || lowerQuery.includes("analysis")) {
        router.push(`/${lang}/ai-assistant/benchmark-ai`);
      }
      else if (lowerQuery.includes("price") || lowerQuery.includes("plan")) {
        router.push(`/${lang}/pricing`);
      }
      else {
        // Default to Library search
        router.push(`/${lang}/library/iso-standards?search=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-inter">
      <Navbar />

      {/* ── Pricing Hero Section ─────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden bg-[#050505] bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]">
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
                {/* 1. ISOBrain Ultra – USD $65/Month */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-black font-space-grotesk tracking-tight text-white"
                  >
                    {t('aiAssistantHome.isobrainUltraTitle')} <span className="text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]">{t('aiAssistantHome.isobrainUltraPrice')}</span>
                  </motion.div>
                )}

                {/* 2. Tagline Description 1 */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                >
                  {t('aiAssistantHome.ultimateCompanionDesc')}
                </motion.p>

                {/* 3. Description 2 */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="text-gray-500 text-xs sm:text-sm italic max-w-xl mx-auto"
                >
                  {t('aiAssistantHome.builtForAuditTeamsDesc')}
                </motion.p>

                {/* 4. Claim your discount badge */}
                {!isPurchased && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-[#00f0ff] text-xs font-black uppercase tracking-[0.2em] w-fit mx-auto"
                  >
                    {t('aiAssistantHome.claimDiscountBadge')}
                  </motion.div>
                )}

                {/* 5. Enhance your skills before time runs out! */}
                {!isPurchased && (
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight font-space-grotesk"
                  >
                    {t('aiAssistantHome.enhanceSkillsHeading')}
                  </motion.h3>
                )}

                {/* 6. Get ISOBrain Ultra — Enhance your career at a lower price */}
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
                      <span>{t('aiAssistantHome.getStartedBtn')}</span>
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
                          { label: t('aiAssistantHome.hours'), value: timeLeft.hours },
                          { label: t('aiAssistantHome.mins'), value: timeLeft.minutes },
                          { label: t('aiAssistantHome.secs'), value: timeLeft.seconds, isAccent: true }
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

              {/* What you get details */}
              <div className="mt-20 border-t border-white/5 pt-16 max-w-7xl mx-auto text-center">
                <h4 className="text-xl sm:text-2xl font-black text-white font-space-grotesk uppercase tracking-wider mb-2">
                  {isPurchased ? t('aiAssistantHome.yourPlanBenefits') : t('aiAssistantHome.forUSDYouGet')}
                </h4>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-12 font-inter">
                  {t('aiAssistantHome.everythingInPro')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {/* Benefit 1 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('aiAssistantHome.unlimitedAIAccessTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('aiAssistantHome.unlimitedAIAccessDesc')}
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('aiAssistantHome.isoNavigatorTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('aiAssistantHome.isoNavigatorBenefitDesc')}
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('aiAssistantHome.auditLensTitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('aiAssistantHome.auditLensBenefitDesc')}
                    </p>
                  </div>

                  {/* Benefit 4 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('aiAssistantHome.benchmarkAITitle')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('aiAssistantHome.benchmarkAIBenefitDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Showcase - Scrollytelling style (Simplified for web) */}
      {/* <section className="py-16 md:py-32 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-24">
            <h2 className="space-grotesk text-2xl sm:text-4xl lg:text-[42px] font-semibold text-white text-center leading-[1.2] tracking-tight mb-6 md:mb-8">{t('aiAssistantHome.protocolExecution')}</h2>
            <p className="text-[#A1A1A6] text-sm lg:text-lg font-medium max-w-xl mx-auto text-center leading-relaxed font-inter">{t('aiAssistantHome.protocolSubheading')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('aiAssistantHome.ingestionTitle'),
                desc: t('aiAssistantHome.ingestionDesc'),
                icon: Database,
                color: "text-[#00f0ff]",
                bg: "bg-[#00f0ff]/10"
              },
              {
                title: t('aiAssistantHome.analysisTitle'),
                desc: t('aiAssistantHome.analysisDesc'),
                icon: Search,
                color: "text-[#00f0ff]",
                bg: "bg-[#00f0ff]/10"
              },
              {
                title: t('aiAssistantHome.generationTitle'),
                desc: t('aiAssistantHome.generationDesc'),
                icon: Zap,
                color: "text-[#00f0ff]",
                bg: "bg-[#00f0ff]/10"
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-6 sm:p-12 rounded-3xl sm:rounded-[40px] bg-[#0A0A0A] border border-white/5 group transition-all duration-700 hover:border-white/10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-white/10 transition-colors" />
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 sm:mb-10 group-hover:scale-110 transition-transform relative z-10`}>
                  <feat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feat.color}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-space-grotesk mb-4 uppercase tracking-wider relative z-10">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium relative z-10">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Product Modules - The Bento Grid */}
      <section className="py-16 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 md:mb-20">
            <div className="max-w-6xl text-center mx-auto">
              <h2 className="space-grotesk text-2xl text-center  font-semibold text-white leading-[1.2] tracking-tight mb-6 sm:mb-8">{t('aiAssistantHome.neuralEcosystemTitle')}</h2>
              <p className="text-[#A1A1A6] text-sm lg:text-lg font-medium leading-relaxed font-inter text-center">{t('aiAssistantHome.neuralEcosystemDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ISO Navigator */}
            <div className="group relative overflow-hidden rounded-3xl md:rounded-[56px] bg-[#0A0A0A] border border-white/5 p-6 md:p-16 transition-all duration-1000 shadow-2xl">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-6">
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10 leading-tight">
                    {t('aiAssistantHome.protocolExecution')}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono shrink-0">{t('aiAssistantHome.codeNav')}</div>
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-4">{t('aiAssistantHome.isoNavigator')}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 h-auto md:h-12 md:overflow-hidden">
                  {t('aiAssistantHome.navigatorDesc')}
                </p>
                <Link
                  href={`/${lang}/ai-assistant/iso-navigator`}
                  className="group/btn inline-flex items-center gap-2 text-[#00f0ff] text-xs font-bold uppercase tracking-widest"
                >
                  {t('aiAssistantHome.initializeSync')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] w-[70%] h-[70%] opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 pointer-events-none">
                <Globe className="w-full h-full text-white" />
              </div>
            </div>

            {/* Audit Lens */}
            <div className="group relative overflow-hidden rounded-3xl md:rounded-[56px] bg-[#0A0A0A] border border-white/5 p-6 md:p-16 transition-all duration-1000 hover:border-[#8A2BE2]/40 shadow-2xl">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-6">
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10 leading-tight">
                    {t('aiAssistantHome.forensicCore')}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono shrink-0">{t('aiAssistantHome.codeAud')}</div>
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-4">{t('aiAssistantHome.auditLens')}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 h-auto md:h-12 md:overflow-hidden">
                  {t('aiAssistantHome.auditDesc')}
                </p>
                <Link
                  href={`/${lang}/ai-assistant/audit-lens`}
                  className="group/btn inline-flex items-center gap-2 text-[#00f0ff] text-xs font-bold uppercase tracking-widest "
                >
                  {t('aiAssistantHome.auditBtn')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] w-[70%] h-[70%] opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 pointer-events-none">
                <ShieldCheck className="w-full h-full text-white" />
              </div>
            </div>

            {/* Benchmark AI */}
            <div className="group relative overflow-hidden rounded-3xl md:rounded-[48px] bg-[#121214] border border-white/5 p-6 md:p-12 transition-all duration-700 hover:border-emerald-500/30 shadow-2xl">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-6">
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10 leading-tight">
                    {t('aiAssistantHome.evaluation')}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono shrink-0">{t('aiAssistantHome.codeBen')}</div>
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-4">{t('aiAssistantHome.benchmarkAi')}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 h-auto md:h-12 md:overflow-hidden">
                  {t('aiAssistantHome.benchmarkDesc')}
                </p>
                <Link
                  href={`/${lang}/ai-assistant/benchmark-ai`}
                  className="group/btn inline-flex items-center gap-2 text-[#00f0ff] text-xs font-bold uppercase tracking-widest"
                >
                  {t('aiAssistantHome.benchmarkBtn')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[45%] h-[60%] bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden group-hover:bg-white/10 transition-all duration-700 pointer-events-none">
                <BarChart3 className="w-32 h-32 text-emerald-500/20" />
              </div>
            </div>

            {/* ISO Library */}
            <div className="group relative overflow-hidden rounded-3xl md:rounded-[48px] bg-[#121214] border border-white/5 p-6 md:p-12 transition-all duration-700 hover:border-amber-500/30 shadow-2xl">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-6">
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10 leading-tight">
                    {t('aiAssistantHome.knowledgeBase')}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono shrink-0">{t('aiAssistantHome.codeLib')}</div>
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-4">{t('aiAssistantHome.isoLibrary')}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 h-auto md:h-12 md:overflow-hidden">
                  {t('aiAssistantHome.libraryDesc')}
                </p>
                <Link
                  href={`/${lang}/library/iso-standards`}
                  className="group/btn inline-flex items-center gap-2 text-[#00f0ff] text-xs font-bold uppercase tracking-widest"
                >
                  {t('aiAssistantHome.libraryBtn')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-[-5%] bottom-[-5%] w-[50%] h-[50%] opacity-20 group-hover:opacity-40 transition-all duration-700 pointer-events-none">
                <FileText className="w-full h-full text-amber-500/50" />
              </div>
            </div>
          </div>

          {/* ISO Academy Card */}
          <div className="mt-8 flex justify-center">
            <div className="group relative overflow-hidden rounded-3xl md:rounded-[48px] bg-[#121214] border border-white/5 p-6 md:p-12 transition-all duration-700 hover:border-cyan-500/30 shadow-2xl w-full max-w-4xl">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-6">
                  <div className="text-[9px] sm:text-[11px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10 leading-tight">
                    {t('aiAssistantHome.isoAcademyBadge')}</div>
                  <div className="text-[10px] text-gray-600 font-mono shrink-0">{t('aiAssistantHome.codeAca')}</div>
                </div>
                <h3 className="text-2xl font-bold font-space-grotesk mb-4">{t('aiAssistantHome.isoAcademy')}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {t('aiAssistantHome.academyCardDesc')}
                </p>
                <Link
                  href={`/${lang}/academy`}
                  className="group/btn inline-flex items-center gap-2 text-[#00f0ff] text-xs font-bold uppercase tracking-widest"
                >
                  {t('aiAssistantHome.startLearning')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-[-5%] bottom-[-5%] w-[50%] h-[50%] opacity-20 group-hover:opacity-40 transition-all duration-700 pointer-events-none">
                <GraduationCap className="w-full h-full text-cyan-500/50" />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Wrapper */}
      <div className="bg-[#09090B] pb-32">
        {/* <FAQ faqData={faqData} /> */}
        <ReviewSection />
      </div>

      <Footer />

      <style jsx global>{`
        .font-space-grotesk {
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .rotate-x-2 {
          transform: rotateX(2deg);
        }
      `}</style>
    </div>
  );
};

export default AIAssistantHome;
