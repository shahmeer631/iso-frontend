"use client";

import React, { useState } from "react";
import { Check, Clock, Zap, Info, Shield, CreditCard, Lock, ArrowDown, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
// Upgrade subscrtiption from here
import { useCreatePaymentIntentMutation, useUpgradeSubscriptionMutation } from "@/lib/redux/features/payments/paymentApi";
import { useCheckEnrollmentMutation } from "@/lib/redux/features/auth/authApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import PricingCardButton from "./PricingCardButton";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  userHasAnyPaidAccess,
  userOwnsPlanId,
  userHasPlanTier,
} from "@/lib/access/effectiveAccess";

// Helper to decode JWT token to get user info if Redux user is missing
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

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const PricingSection = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const router = useRouter();
  const { data: response, isLoading, isError } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  //upgrade subscription
  const [upgradeSubscription] = useUpgradeSubscriptionMutation();
  const [checkEnrollment] = useCheckEnrollmentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  const plans = response?.data || [];

  // Upgrade subscription start
  // Includes User Group grants (cash/offline) — not only Stripe subscriptions
  const hasPurchasedAnyPlan = userHasAnyPaidAccess(user);

  // Upgrade subscription end

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
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);

  React.useEffect(() => {
    const courseId = searchParams.get("courseId");
    if (!courseId || !user) return;

    const verifyExistingOwnership = async () => {
      setIsVerifyingOwnership(true);
      try {
        const result = await checkEnrollment({ courseId }).unwrap();
        const isEnrolled = result?.success === true || result?.enrolled || result?.isEnrolled || result?.isPurchased || result?.data?.enrolled || result?.data?.isEnrolled || result?.data?.isPurchased || !!result?.data?.id;
        if (isEnrolled) router.push(`/${lang}/academy`);
      } catch (error) {
        console.error("Failed to verify existing enrollment status:", error);
      } finally {
        setIsVerifyingOwnership(false);
      }
    };
    verifyExistingOwnership();
  }, [searchParams, user, checkEnrollment, lang, router]);

  const handlePlanSelect = async (plan: Plan) => {
    if (!currentUserId) {
      router.push(`/${lang}/auth/login`);
      return;
    }

    const isFree = plan.discountedPrice === 0 || plan.name?.toLowerCase().includes("free");
    if (isFree) {
      router.push(`/${lang}/academy`);
      return;
    }

    // Upgrade subscription start

    if (hasPurchasedAnyPlan) {
      try {
        setProcessingPlanId(plan._id || plan.id);
        const result = await upgradeSubscription({
          newPlanId: plan.id || plan._id || "",
        }).unwrap();

        if (result.success) {
          toast.success(t('pricingPage.upgradeSuccess', `Successfully upgraded to ${plan.name}!`));
          
          // Trigger polling in AuthHydrator to update Redux state with the new plan
          sessionStorage.setItem("just_purchased", plan.id || plan._id || "");
          
          router.push(`/${lang}/academy`);
        } else {
          toast.error(result.message || t('pricingPage.upgradeError', 'Failed to upgrade plan.'));
        }
      } catch (error) {
        console.error("Failed to upgrade subscription:", error);
        toast.error(t('pricingPage.upgradeError', 'Failed to upgrade plan. Please try again.'));
      } finally {
        setProcessingPlanId(null);
      }
      return;
    }

    // Upgrade subscription end
    const isAdmin = user?.role === "admin" || (token ? decodeJwt(token)?.role === "admin" : false);

    if (isAdmin) {
      toast.warning(t('pricingPage.adminWarning', 'Admin Account: Real payments are disabled for admin roles. Redirecting to Sandbox checkout...'), {
        description: t('pricingPage.adminWarningDesc', 'Admins are not allowed to make live transactions. Test credentials have been prefilled for your convenience.'),
        duration: 5000,
      });
      setTimeout(() => {
        const mockQueryParams = new URLSearchParams({
          clientSecret: "pi_mock_123_secret_mock_456",
          planName: plan.name,
          price: plan.discountedPrice.toString(),
          originalPrice: plan.originalPrice.toString(),
          isMock: "true",
          isAdminPayment: "true",
        }).toString();
        router.push(`/${lang}/payment?${mockQueryParams}`);
      }, 1500);
      return;
    }

    try {
      setProcessingPlanId(plan._id || plan.id);
      const courseId = searchParams.get("courseId") || undefined;
      const result = await createPaymentIntent({
        planId: plan.id,
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
            planId: plan.id || plan._id || "",
            planName: plan.name,
            price: plan.discountedPrice.toString(),
            originalPrice: plan.originalPrice.toString(),
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

      const isConnectionError =
        err?.data?.err?.type?.includes("Stripe") ||
        JSON.stringify(err).includes("Stripe") ||
        JSON.stringify(error).includes("customer");

      if (isConnectionError) {
        const confirmMock = window.confirm(t('pricingPage.stripeError', 'Stripe payment initiation failed. Do you want to proceed with a mock checkout?'));
        if (confirmMock) {
          const mockQueryParams = new URLSearchParams({
            clientSecret: "pi_mock_123_secret_mock_456",
            planName: plan.name,
            price: plan.discountedPrice.toString(),
            originalPrice: plan.originalPrice.toString(),
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

  if (isLoading || isVerifyingOwnership) {
    return (
      <section className="py-10 bg-[#0A0A0C] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%]bg-[#00f0ff] text-[#0F111A]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12 lg:mb-20 items-stretch">
            {[0, 1, 2].map((index) => {
              const isPopular = index === 1;
              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-[32px] p-5 lg:p-8 h-full min-h-[600px] ${isPopular
                    ? "bg-[#1A1A1E] border border-white/10 z-10 shadow-2xl"
                    : "bg-[#141416] border border-white/5"
                    }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-white/10 rounded-full animate-pulse" />
                  )}

                  <div className="mb-2 text-center mt-2">
                    <div className="h-8 w-32 bg-white/10 rounded-full mx-auto mb-6 animate-pulse" />
                    <div className="flex flex-col items-center gap-2 mb-8">
                      <div className="h-3 w-4/5 bg-white/5 rounded-full animate-pulse" />
                      <div className="h-3 w-3/5 bg-white/5 rounded-full animate-pulse" />
                    </div>

                    <div className="flex justify-center mb-6">
                      <div className="h-16 w-40 bg-white/10 rounded-xl animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-grow mb-8 lg:mb-10 text-left pr-2 lg:pr-0">
                    <ul className="h-full flex flex-col mt-4 lg:mt-6 space-y-4 lg:space-y-5">
                      {[...Array(5)].map((_, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 rounded-full bg-white/10 animate-pulse" />
                          <div className="flex-1 space-y-2 mt-1">
                            <div className="h-3 w-full bg-white/5 rounded-full animate-pulse" />
                            <div className={`h-3 bg-white/5 rounded-full animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-4/5'}`} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto h-14 md:h-16 w-full bg-white/10 rounded-2xl animate-pulse" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%]bg-[#00f0ff] text-[#0F111A]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12 lg:mb-20 items-stretch">
          {plans.map((plan, index) => {
            const isPopular = plan.badge === "Most Popular" || plan.name.toLowerCase() === "gold" || index === 1;
            const isEnterprise = plan.name.toLowerCase().includes("enterprise") || index === 2;
            const isFree = index === 0;

            const displayPrice = plan.discountedPrice;
            const period = plan.validityDays ? ` / ${plan.validityDays} ${t('pricingPage.days')}` : "";

            const planKey = plan.name?.toLowerCase().includes("ultra")
              ? "ULTRA"
              : plan.name?.toLowerCase().includes("pro")
                ? "PRO"
                : plan.name?.toLowerCase().includes("plus")
                  ? "PLUS"
                  : null;
            const isPurchased =
              userOwnsPlanId(user, plan.id || plan._id) ||
              (!!planKey && userHasPlanTier(user, planKey));
            // CHANGE: Custom button texts & microcopy variables mapped for each plan
            let displayButtonText = "";
            let microcopyText = "";

            if (index === 0) {
              displayButtonText = t('pricingPage.startPlusFree');
              microcopyText = t('pricingPage.plusMicrocopy');
            } else if (index === 1) {
              displayButtonText = t('pricingPage.tryProFree');
              microcopyText = t('pricingPage.proMicrocopy');
            } else {
              displayButtonText = t('pricingPage.startTrialZero');
              microcopyText = t('pricingPage.ultraMicrocopy');
            }

            const buttonText = (hasPurchasedAnyPlan && !isFree) ? t('pricingPage.upgrade') : displayButtonText;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col rounded-[32px] p-5 lg:p-8 transition-all duration-500 h-full ${isPopular
                  ? "bg-[#1A1A1E] border border-white/10 z-10 shadow-2xl"
                  : isEnterprise
                    ? "bg-[#0D0D0F] border border-white/5"
                    : "bg-[#141416] border border-white/5"
                  }`}
              >
                {/* Glowing Border for Popular */}
                {isPopular && (
                  <div className="absolute inset-[-1px] rounded-[32px] bg-gradient-to-br from-brand-cyan via-[#5F3EED] to-violet-600 opacity-30 blur-[1px] -z-10 animate-pulse" />
                )}

                {/* Badges */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-cyan to-violet-600 text-white px-5 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest shadow-lg whitespace-nowrap">
                    {plan.badge || ""}
                  </div>
                )}

                {isPurchased && (
                  <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] font-medium uppercase tracking-widest text-emerald-400">{t('pricingPage.purchased')}</span>
                  </div>
                )}

                <div className="mb-2 text-left">
                  <h3 className={`text-2xl text-center font-medium mb-2 ${isPopular ? "text-white" : "text-gray-200"}`}>
                    {plan.name}
                  </h3>

                  <p className="text-gray-400 font-sm text-sm  text-center mb-6">{plan.description}</p>

                  <div className="flex flex-col justify-center items-center  mb-2 ml-12">
                    {plan.originalPrice > 0 && plan.originalPrice !== plan.discountedPrice && (
                      <div className="flex items-baseline justify-center gap-x-1.5 mb-1">
                        <span className="relative text-lg lg:text-xl font-medium text-gray-300 px-1">
                          {t('pricingPage.was')} ${plan.originalPrice}
                          <span className="absolute left-0 right-0 top-[50%] h-[1.5px] bg-red-500 -translate-y-1/2" />
                        </span>
                        <span className="text-xs lg:text-sm font-medium text-gray-500">
                          {period || ` / ${t('pricingPage.wasOneTime', 'month')}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-end justify-center flex-wrap gap-x-2 gap-y-1">
                      <span className="text-4xl lg:text-6xl font-medium tracking-tighter text-white font-space-grotesk leading-none">
                        ${displayPrice}
                      </span>
                      <span className="text-xs lg:text-sm font-medium text-gray-500 mb-1">{period || ` / ${t('pricingPage.oneTime')}`}</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-grow mb-6 lg:mb-8 text-left pr-2 lg:pr-0">
                  <ul className="h-full flex flex-col space-y-3 lg:space-y-4 mt-4 lg:mt-6">
                    {plan.featuresDescription?.map((feature, i) => (
                      <li key={i} className="flex flex-col gap-1 group">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan/10 to-violet-600/10 border border-brand-cyan/20 group-hover:border-brand-cyan/40 group-hover:shadow-[0_0_12px_rgba(63,62,237,0.4)] transition-all duration-300">
                            <Check className="w-3 h-3 text-brand-cyan drop-shadow-[0_0_8px_rgba(63,62,237,0.8)]" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[13px] text-gray-400 font-normal leading-relaxed">
                              <strong className="text-white font-medium mr-1.5">{feature.title}{feature.description ? ":" : ""}</strong>
                              {feature.description}
                            </h4>
                          </div>
                        </div>

                        {/* Sub Features */}
                        {feature.subFeatures && feature.subFeatures.length > 0 && (
                          <div className="ml-8 space-y-3 mt-2 border-l border-white/10 pl-5">
                            {feature.subFeatures.map((sub, subIdx) => (
                              <div key={subIdx} className="flex items-start gap-2 relative">
                                <div className="w-1 h-1 rounded-fullbg-[#00f0ff] text-[#0F111A]/40 mt-2 shrink-0" />
                                <p className="text-[13px] text-gray-400 leading-relaxed">
                                  {sub.name && (
                                    <strong className="text-white font-medium mr-1.5">
                                      {sub.name}:
                                    </strong>
                                  )}
                                  {sub.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CHANGE: Added custom CTA Button and Microcopy underneath */}
                <div className="mt-auto flex flex-col items-center w-full gap-2.5">
                  {!isPurchased && (
                    <>
                      <button
                        onClick={() => handlePlanSelect(plan)}
                        disabled={processingPlanId === plan.id}
                        className={`w-full cursor-pointer py-4 md:py-5 rounded-2xl font-bold text-xs sm:text-[13px] uppercase tracking-wider whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 ${hasPurchasedAnyPlan
                          ? "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]"
                          : isPopular
                            ? "bg-white text-black hover:bg-blue-50 shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                            : "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]"
                          }`}
                      >
                        {processingPlanId === plan.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {buttonText}
                            <ArrowDown className={`w-4 h-4 -rotate-[135deg] shrink-0 ${isPopular ? "text-brand-cyan" : "text-gray-500"}`} />
                          </>
                        )}
                      </button>
                      <p className="text-[11px] sm:text-xs text-gray-400 text-center font-medium leading-normal font-inter px-1 whitespace-nowrap">
                        {microcopyText}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .font-space-grotesk {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
    </section>
  );
};

export default PricingSection;
