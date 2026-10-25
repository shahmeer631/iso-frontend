"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import {
  useCreatePaymentIntentMutation,
  useUpgradeSubscriptionMutation,
} from "@/lib/redux/features/payments/paymentApi";
import { useCheckEnrollmentMutation } from "@/lib/redux/features/auth/authApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from "sonner";
import { userHasAnyPaidAccess, userOwnsPlanId } from "@/lib/access/effectiveAccess";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

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
  } catch {
    return null;
  }
};

const PricingSection = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { data: response, isLoading, isError } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [upgradeSubscription] = useUpgradeSubscriptionMutation();
  const [checkEnrollment] = useCheckEnrollmentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

  const plans = response?.data || [];
  const hasPurchasedAnyPlan = userHasAnyPaidAccess(user);

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
        const isEnrolled =
          result?.success === true ||
          result?.enrolled ||
          result?.isEnrolled ||
          result?.isPurchased ||
          result?.data?.enrolled ||
          result?.data?.isEnrolled ||
          result?.data?.isPurchased ||
          !!result?.data?.id;
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

    const isFree =
      plan.discountedPrice === 0 || plan.name?.toLowerCase().includes("free");
    if (isFree) {
      router.push(`/${lang}/academy`);
      return;
    }

    if (hasPurchasedAnyPlan) {
      try {
        setProcessingPlanId(plan._id || plan.id);
        const result = await upgradeSubscription({
          newPlanId: plan.id || plan._id || "",
        }).unwrap();

        if (result.success) {
          toast.success(
            t("pricingPage.upgradeSuccess", `Successfully upgraded to ${plan.name}!`)
          );
          sessionStorage.setItem("just_purchased", plan.id || plan._id || "");
          router.push(`/${lang}/academy`);
        } else {
          toast.error(
            result.message || t("pricingPage.upgradeError", "Failed to upgrade plan.")
          );
        }
      } catch (error) {
        console.error("Failed to upgrade subscription:", error);
        toast.error(
          t("pricingPage.upgradeError", "Failed to upgrade plan. Please try again.")
        );
      } finally {
        setProcessingPlanId(null);
      }
      return;
    }

    const isAdmin =
      user?.role === "admin" || (token ? decodeJwt(token)?.role === "admin" : false);

    if (isAdmin) {
      toast.warning(
        t(
          "pricingPage.adminWarning",
          "Admin Account: Real payments are disabled for admin roles. Redirecting to Sandbox checkout..."
        ),
        {
          description: t(
            "pricingPage.adminWarningDesc",
            "Admins are not allowed to make live transactions. Test credentials have been prefilled for your convenience."
          ),
          duration: 5000,
        }
      );
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
        const hostedUrl =
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })
            ?.checkoutUrl ||
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })
            ?.sessionUrl ||
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })?.url;
        if (
          hostedUrl &&
          typeof hostedUrl === "string" &&
          (hostedUrl.startsWith("http://") || hostedUrl.startsWith("https://"))
        ) {
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
      const err = error as {
        data?: { err?: { type?: string } };
        status?: number;
        message?: string;
      };
      console.error("Failed to create payment intent:", error);

      if (err?.status === 500) {
        toast.error(
          t(
            "pricingPage.serverError",
            "Internal Server Error: Could not initiate payment. Please try again later."
          )
        );
        return;
      }

      const isConnectionError =
        err?.data?.err?.type?.includes("Stripe") ||
        JSON.stringify(err).includes("Stripe") ||
        JSON.stringify(error).includes("customer");

      if (isConnectionError) {
        const confirmMock = window.confirm(
          t(
            "pricingPage.stripeError",
            "Stripe payment initiation failed. Do you want to proceed with a mock checkout?"
          )
        );
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
        toast.error(
          t(
            "pricingPage.paymentError",
            "Failed to initiate payment. Please try again."
          )
        );
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (isError) {
    return (
      <section className="px-4 py-16 sm:px-6">
        <div className="ib-card mx-auto max-w-lg py-12 text-center">
          <p className="font-medium text-red-500">
            {t("pricingPage.paymentError", "Failed to load plans. Please try again.")}
          </p>
        </div>
      </section>
    );
  }

  if (isLoading || isVerifyingOwnership) {
    return (
      <section className="relative overflow-x-clip px-4 py-10 sm:px-6">
        <div className="ib-w max-w-7xl!">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`ib-card flex min-h-[560px] flex-col p-6 sm:p-8 ${
                  index === 1
                    ? "border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] shadow-[0_20px_50px_-28px_rgba(27,77,219,0.4)]"
                    : ""
                }`}
              >
                <div className="mb-6 space-y-3">
                  <div className="mx-auto h-7 w-28 animate-pulse rounded-full bg-[var(--ib-accbg)]" />
                  <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-[var(--ib-bg)]" />
                  <div className="mx-auto h-12 w-36 animate-pulse rounded-xl bg-[var(--ib-accbg)]" />
                </div>
                <div className="flex-1 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-5 shrink-0 animate-pulse rounded-full bg-[var(--ib-accbg)]" />
                      <div className="h-3 flex-1 animate-pulse rounded-full bg-[var(--ib-bg)]" />
                    </div>
                  ))}
                </div>
                <div className="mt-auto h-14 w-full animate-pulse rounded-[10px] bg-[var(--ib-accbg)]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-x-clip px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
      >
        <div className="absolute left-[-8%] top-[-5%] h-[50%] w-[50%] rounded-full bg-[var(--ib-accbg)] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-8%] h-[40%] w-[40%] rounded-full bg-[color-mix(in_srgb,var(--ib-acc)_10%,transparent)] blur-[120px]" />
      </div>

      <div className="ib-w relative z-[1] max-w-7xl!">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
          {plans.map((plan, index) => {
            const isPopular =
              plan.badge === "Most Popular" ||
              plan.name.toLowerCase() === "gold" ||
              index === 1;
            const isFree = index === 0;
            const displayPrice = plan.discountedPrice;
            const period = plan.validityDays
              ? ` / ${plan.validityDays} ${t("pricingPage.days")}`
              : "";

            const isPurchased = userOwnsPlanId(user, plan.id || plan._id);

            let displayButtonText = "";
            let microcopyText = "";

            if (index === 0) {
              displayButtonText = t("pricingPage.startPlusFree");
              microcopyText = t("pricingPage.plusMicrocopy");
            } else if (index === 1) {
              displayButtonText = t("pricingPage.tryProFree");
              microcopyText = t("pricingPage.proMicrocopy");
            } else {
              displayButtonText = t("pricingPage.startTrialZero");
              microcopyText = t("pricingPage.ultraMicrocopy");
            }

            const buttonText = isPurchased
              ? t("pricingPage.currentPlan", "Current Plan")
              : hasPurchasedAnyPlan && !isFree
                ? t("pricingPage.upgrade")
                : displayButtonText;

            return (
              <motion.article
                key={plan.id || plan._id || index}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease,
                }}
                className={`relative flex h-full flex-col rounded-[24px] border bg-[var(--ib-card)] p-6 transition-all duration-300 sm:p-8 lg:rounded-[28px] ${
                  isPopular
                    ? "z-[1] border-[color-mix(in_srgb,var(--ib-acc)_45%,var(--ib-line))] shadow-[0_22px_50px_-28px_rgba(27,77,219,0.45)] hover:-translate-y-1"
                    : "border-[var(--ib-line)] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:shadow-[0_18px_40px_-28px_rgba(27,77,219,0.3)]"
                }`}
              >
                {isPopular && plan.badge ? (
                  <div className="absolute -top-3.5 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ib-acc)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_8px_20px_-8px_rgba(27,77,219,0.6)]">
                    {plan.badge}
                  </div>
                ) : null}

                {isPurchased ? (
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
                    <Check className="size-3 text-emerald-500" aria-hidden />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                      {t("pricingPage.purchased")}
                    </span>
                  </div>
                ) : null}

                <div className={`mb-5 text-center ${isPopular && plan.badge ? "mt-3" : ""}`}>
                  <h3
                    className={`mb-0! text-[22px] font-bold tracking-[-0.02em] sm:text-[24px] ${
                      isPopular ? "text-[var(--ib-acc)]" : "text-[var(--ib-ink)]"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  {plan.description ? (
                    <p className="mx-auto mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                      {plan.description}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-col items-center">
                    {plan.originalPrice > 0 &&
                    plan.originalPrice !== plan.discountedPrice ? (
                      <div className="mb-1 flex items-baseline justify-center gap-1.5">
                        <span className="relative px-1 text-[16px] font-medium text-[var(--ib-mute)] sm:text-[18px]">
                          {t("pricingPage.was")} ${plan.originalPrice}
                          <span
                            aria-hidden
                            className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-red-500"
                          />
                        </span>
                        <span className="text-[12px] font-medium text-[var(--ib-mute)] sm:text-[13px]">
                          {period || ` / ${t("pricingPage.wasOneTime", "month")}`}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1">
                      <span className="text-[40px] font-bold leading-none tracking-tight text-[var(--ib-ink)] sm:text-[48px] lg:text-[52px]">
                        ${displayPrice}
                      </span>
                      <span className="mb-1 text-[12px] font-medium text-[var(--ib-mute)] sm:text-[13px]">
                        {period || ` / ${t("pricingPage.oneTime")}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex-grow text-left sm:mb-8">
                  <ul className="flex flex-col space-y-3.5 sm:space-y-4">
                    {plan.featuresDescription?.map((feature, i) => (
                      <li key={i} className="group flex flex-col gap-1">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)]">
                            <Check
                              className="size-3 text-[var(--ib-acc)]"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] leading-relaxed text-[var(--ib-mute)]">
                              <strong className="mr-1 font-semibold text-[var(--ib-ink)]">
                                {feature.title}
                                {feature.description ? ":" : ""}
                              </strong>
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        {feature.subFeatures && feature.subFeatures.length > 0 ? (
                          <div className="ml-7 mt-2 space-y-2.5 border-l border-[var(--ib-line)] pl-4">
                            {feature.subFeatures.map((sub, subIdx) => (
                              <div key={subIdx} className="flex items-start gap-2">
                                <div
                                  className="mt-2 size-1 shrink-0 rounded-full bg-[var(--ib-acc)]"
                                  aria-hidden
                                />
                                <p className="text-[12.5px] leading-relaxed text-[var(--ib-mute)]">
                                  {sub.name ? (
                                    <strong className="mr-1 font-semibold text-[var(--ib-ink)]">
                                      {sub.name}:
                                    </strong>
                                  ) : null}
                                  {sub.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA — always visible, never hover-only */}
                <div className="mt-auto flex w-full shrink-0 flex-col items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={
                      processingPlanId === (plan.id || plan._id) || isPurchased
                    }
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] py-4 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] disabled:cursor-not-allowed sm:py-[18px] sm:text-[13px] ${
                      isPurchased
                        ? "border border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-mute)]"
                        : hasPurchasedAnyPlan
                          ? "border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)] active:scale-[0.98]"
                          : isPopular
                            ? "bg-[var(--ib-acc)] text-white shadow-[0_12px_28px_-14px_rgba(27,77,219,0.55)] hover:opacity-95 active:scale-[0.98]"
                            : "border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)] active:scale-[0.98]"
                    }`}
                  >
                    {processingPlanId === (plan.id || plan._id) ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                    ) : (
                      <>
                        <span className="text-center leading-snug">{buttonText}</span>
                        {!isPurchased ? (
                          <ArrowRight
                            className={`size-4 shrink-0 ${
                              isPopular && !hasPurchasedAnyPlan
                                ? "text-white"
                                : "text-[var(--ib-mute)]"
                            }`}
                            aria-hidden
                          />
                        ) : null}
                      </>
                    )}
                  </button>
                  <p className="px-1 text-center text-[11px] font-medium leading-snug text-[var(--ib-mute)] sm:text-[12px]">
                    {microcopyText}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
