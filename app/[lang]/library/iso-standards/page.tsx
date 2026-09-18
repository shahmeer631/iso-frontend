"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import Standards from "@/components/Library/iso-standards/Standards";
import ISOStandardsNexus from "@/components/Library/iso-standards/ISOStandardsNexus";
import { Zap, ArrowRight, } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import { useSearchParams } from "next/navigation";
import "@/lib/i18n/client";
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import OfferTimer from "@/components/landing-page-components/OfferTimer";

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

const Page = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { data: response, isLoading: isPlansLoading } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [inputValue, setInputValue] = useState(initialSearch);
  const [isBarFocused, setIsBarFocused] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

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

  const inputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang as string || "en";

  const { data: categoriesData } = useGetCategoriesQuery();
  const isRTL = i18n.language === 'ar';

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
  const plan = plans.find(p => p.name?.toLowerCase().includes("plus")) || plans[1];
  const isPurchased = user?.purchasedPlanIds?.some(id => id === plan?.id || id === plan?._id);

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      router.push(`/${lang}/academy`);
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

  // Debounce: only update searchTerm after 350ms idle
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue.trim()), 350);
    return () => clearTimeout(timer);
  }, [inputValue]);



  // Ctrl+K / Cmd+K shortcut
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      // Redirect to explorer on shortcut
      router.push(`/${lang}/library/iso-standards/explorer`);
    }
  }, [lang, router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);



  return (
    <div className="min-h-screen bg-[#09090B] text-white font-inter selection:bg-brand-cyan text-[#0F111A]/30">
      {/* ── Pricing Hero Section ─────────────────────────── */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-[#6366F1]/5 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-[#00f0ff]/5 rounded-full blur-[140px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10  ">


          {/* Typography-Based Premium Pricing Layout */}
          <div className="max-w-7xl mx-auto px-4 py-8 font-inter text-gray-300">
            {/* Top Text & Pricing Summary */}
            {!isPurchased && (
              <div className="text-center space-y-8 mb-16 flex flex-col items-center">
                {/* 1. ISOBrain Plus – USD $30/Month */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl sm:text-3xl font-black font-space-grotesk tracking-tight text-white"
                >
                  ISOBrain Plus – <span className="text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]">{t('library.plusPlanPrice')}</span>
                </motion.div>

                {/* 2. The essential toolkit for ISO professionals to master compliance and benchmark their expertise. */}
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
                  {t('library.plusEssentialToolkit')}
                </motion.p>

                {/* 3. Perfect for compliance officers and quality managers who need immediate access to real-world standards and want to validate their baseline expertise. */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="text-gray-500 text-xs sm:text-sm italic max-w-xl mx-auto"
                >
                  {t('library.plusPerfectFor')}
                </motion.p>

                {/* 4. Secure your spot - Skill development made affordable */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-[#00f0ff] text-xs font-black uppercase tracking-[0.2em] w-fit mx-auto "
                >
                  {t('library.plusSecureSpot')}
                </motion.div>

                {/* 5. Take your skills to the next level */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight font-space-grotesk"
                >
                  {t('library.plusTakeSkills')}
                </motion.h3>

                {/* 6. Get ISOBrain Plus - Limited time to save big! */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}

                >
                  <button
                    onClick={() => router.push(`/${lang}/pricing`)}
                    className="group relative inline-flex items-center justify-center gap-3 bg-[#00f0ff] text-[#0F111A] font-bold text-sm sm:text-base px-8 py-5 rounded-[12px] hover:bg-[#00f0ff]/95 transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_55px_rgba(0,240,255,0.45)] transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider cursor-pointer mx-auto"
                  >
                    <span>{t('library.plusCta')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-[#0F111A]" />
                  </button>
                </motion.div>

                {/* 7. Countdown Timer */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="max-w-xl mx-auto my-6 relative group cursor-default pt-4"
                >
                  <div className="relative bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/10 hover:border-[#00F0FF]/40 rounded-3xl py-6 px-10 sm:px-14 flex items-center justify-center gap-8 shadow-2xl transition-all duration-500 overflow-hidden mx-auto w-fit">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent blur-[2px]"></div>

                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 shrink-0 z-10">
                      {[
                        { key: 'hours', label: t('library.countdownHours'), value: timeLeft.hours },
                        { key: 'mins', label: t('library.countdownMins'), value: timeLeft.minutes },
                        { key: 'secs', label: t('library.countdownSecs'), value: timeLeft.seconds, isAccent: true }
                      ].map((time, index) => (
                        <Fragment key={time.label}>
                          <div className="flex flex-col items-center group/timer-item">
                            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-2xl shadow-inner transition-all duration-350 hover:-translate-y-1 ${time.isAccent
                              ? "bg-gradient-to-b from-[#00F0FF]/10 to-transparent border border-[#00F0FF]/40 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                              : "bg-[#14141A] border border-gray-800 text-white"
                              }`}>
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                              {time.value.toString().padStart(2, "0")}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] mt-2 sm:mt-3 uppercase tracking-widest font-semibold ${time.isAccent ? "text-[#00F0FF]" : "text-gray-500"}`}>
                              {time.key === 'hours' ? t('library.countdownHours') : time.key === 'mins' ? t('library.countdownMins') : t('library.countdownSecs')}
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
              </div>
            )}

            {/* Value Matrix Section */}
            {isPurchased && (
              <div className="mt-10   max-w-7xl mx-auto text-left" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <h2 className="text-[28px] sm:text-[36px] font-semibold text-white mb-8 sm:mb-12 leading-[1.3] text-center">
                  {t('library.libraryAcceleratesTitle')}
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-[#1F222F] bg-[#12131A] shadow-2xl">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-[#1F222F] bg-[#090A0F]">
                        <th className="p-6 text-white font-medium text-[20px] sm:text-[22px] w-1/3">{t('library.tableOldWay')}</th>
                        <th className="p-6 text-[#00E5FF] font-medium text-[20px] sm:text-[22px] w-1/3 border-l border-[#1F222F]">{t('library.tableNewWay')}</th>
                        <th className="p-6 text-white font-medium text-[20px] sm:text-[22px] w-1/3 border-l border-[#1F222F]">{t('library.tableCareerValue')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] sm:text-[16px] text-[#94A3B8] leading-[1.6]">
                      <tr className="border-b border-[#1F222F]">
                        <td className="p-6 align-top">
                          <strong className="text-white block mb-2">{t('library.tableRow1OldTitle')}</strong>
                          {t('library.tableRow1OldDesc')}
                        </td>
                        <td className="p-6 align-top border-l border-[#1F222F] bg-[#00E5FF]/5">
                          <strong className="text-[#00E5FF] block mb-2">{t('library.tableRow1NewTitle')}</strong>
                          {t('library.tableRow1NewDesc')}
                        </td>
                        <td className="p-6 align-top border-l border-[#1F222F]">
                          <strong className="text-white block mb-2">{t('library.tableRow1ValTitle')}</strong>
                          {t('library.tableRow1ValDesc')}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-6 align-top">
                          <strong className="text-white block mb-2">{t('library.tableRow2OldTitle')}</strong>
                          {t('library.tableRow2OldDesc')}
                        </td>
                        <td className="p-6 align-top border-l border-[#1F222F] bg-[#00E5FF]/5">
                          <strong className="text-[#00E5FF] block mb-2">{t('library.tableRow2NewTitle')}</strong>
                          {t('library.tableRow2NewDesc')}
                        </td>
                        <td className="p-6 align-top border-l border-[#1F222F]">
                          <strong className="text-white block mb-2">{t('library.tableRow2ValTitle')}</strong>
                          {t('library.tableRow2ValDesc')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* What you get details (Vertically stacked, centered typography) */}
            {!isPurchased && (
              <div className="mt-20 border-t border-white/5 pt-16 max-w-7xl mx-auto text-center">
                <h4 className="text-xl sm:text-2xl font-black text-white font-space-grotesk uppercase tracking-wider mb-12">
                  {t('library.forUsd30YouGet')}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                  {/* Benefit 1 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('library.benefit1Title')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('library.benefit1Desc')}
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('library.benefit2Title')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('library.benefit2Desc')}
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('library.benefit3Title')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('library.benefit3Desc')}
                    </p>
                  </div>

                  {/* Benefit 4 */}
                  <div className="space-y-3">
                    <h5 className="text-base sm:text-lg font-bold text-[#00f0ff] font-space-grotesk tracking-wide uppercase">
                      {t('library.benefit4Title')}
                    </h5>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light font-inter max-w-xl mx-auto">
                      {t('library.benefit4Desc')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── High-Tech ISO Nexus (New Dynamic Grid) ─────────────────────────── */}
      <ISOStandardsNexus searchTerm={searchTerm} />

      {/* ── Final CTA Section ─────────────────────────── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#090A0F]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl md:rounded-[48px] bg-[#12131A] border border-[#1F222F] p-6 sm:p-12 md:p-20 text-center overflow-hidden"
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-[28px] sm:text-[36px] font-semibold text-white leading-[1.3] mb-6">
                {t('library.ctaTitle')}
              </h2>
              <p className="text-[16px] sm:text-[18px] font-medium text-[#94A3B8] leading-[1.4] max-w-3xl mb-12">
                {t('library.ctaDesc')}
              </p>

              <Link
                href="#"
                className="inline-flex items-center gap-3 bg-[#00E5FF] text-[#090A0F] px-8 py-4 sm:px-10 sm:py-5 rounded-xl font-bold text-[12px] sm:text-[14px] tracking-[1px] uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all"
              >
                {t('library.ctaBtn')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Page;
