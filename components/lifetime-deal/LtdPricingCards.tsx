"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  selectCurrentUser,
  selectCurrentToken,
} from "@/lib/redux/features/auth/authSlice";
import { useCreateLifetimeDealCheckoutMutation } from "@/lib/redux/features/lifetimeDeal/lifetimeDealApi";
import { extractApiErrorMessage } from "@/lib/access/effectiveAccess";
import {
  LTD_TIER_CONTENT,
  type LtdTier,
  type PublicPromotionStatus,
} from "@/lib/lifetimeDeal/types";

const ease = [0.22, 1, 0.36, 1] as const;

type LtdPricingCardsProps = {
  promotion: PublicPromotionStatus;
};

const priceForTier = (promotion: PublicPromotionStatus, tier: LtdTier) => {
  if (tier === "PLUS") return promotion.prices.plus;
  if (tier === "PRO") return promotion.prices.pro;
  return promotion.prices.ultra;
};

const anchorForTier = (promotion: PublicPromotionStatus, tier: LtdTier) => {
  if (tier === "PLUS") return promotion.annualAnchors.plus;
  if (tier === "PRO") return promotion.annualAnchors.pro;
  return promotion.annualAnchors.ultra;
};

/**
 * LTD tier cards from the client document.
 * Phase 3: validates eligibility only — does not process Stripe payments.
 */
const LtdPricingCards = ({ promotion }: LtdPricingCardsProps) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [createCheckout] = useCreateLifetimeDealCheckoutMutation();
  const [processingTier, setProcessingTier] = useState<LtdTier | null>(null);

  const handleClaim = async (tier: LtdTier) => {
    if (!promotion.isPurchasable || promotion.status !== "ACTIVE") {
      toast.error(
        t(
          "ltd.offerEnded",
          "The 7-Day Lifetime Access Offer Has Ended. Standard Subscription Plans Apply.",
        ),
      );
      return;
    }

    if (!user && !token) {
      router.push(`/${lang}/auth/login?from=/${lang}/pricing`);
      return;
    }

    try {
      setProcessingTier(tier);
      const idempotencyKey = `ltd-${tier}-${user?.id || "user"}-${promotion.promotionId}`;
      const result = await createCheckout({
        tier,
        promotionId: promotion.promotionId,
        lang,
        idempotencyKey,
        // amount omitted — server uses configured LTD prices
      }).unwrap();

      const checkoutUrl = result.data?.checkoutUrl;
      if (
        checkoutUrl &&
        (checkoutUrl.startsWith("https://") || checkoutUrl.startsWith("http://"))
      ) {
        window.location.href = checkoutUrl;
        return;
      }

      toast.error(
        t(
          "ltd.checkoutUrlMissing",
          "Checkout could not be started. Please try again.",
        ),
      );
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        t(
          "ltd.validateError",
          "Unable to validate this lifetime plan. Please try again.",
        ),
      );
      const lower = message.toLowerCase();
      if (
        lower.includes("already own") ||
        lower.includes("already_owned")
      ) {
        toast.error(
          t(
            "ltd.alreadyOwned",
            "You already have this lifetime tier. Choose a higher plan to upgrade.",
          ),
        );
      } else if (
        lower.includes("cannot downgrade") ||
        lower.includes("invalid_upgrade")
      ) {
        toast.error(
          t(
            "ltd.noDowngrade",
            "Lifetime access cannot be downgraded. Keep your current tier or upgrade higher.",
          ),
        );
      } else {
        toast.error(message);
      }
    } finally {
      setProcessingTier(null);
    }
  };

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
          {LTD_TIER_CONTENT.map((tierDef, index) => {
            const price = priceForTier(promotion, tierDef.tier);
            const annual = anchorForTier(promotion, tierDef.tier);
            const isPopular = Boolean(tierDef.highlight);

            return (
              <motion.article
                key={tierDef.tier}
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
                <div className="absolute -top-3.5 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ib-acc)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_8px_20px_-8px_rgba(27,77,219,0.6)]">
                  {t(tierDef.badgeKey)}
                </div>

                <div className="mb-5 mt-3 text-center">
                  <h3
                    className={`mb-0! text-[22px] font-bold tracking-[-0.02em] sm:text-[24px] ${
                      isPopular ? "text-[var(--ib-acc)]" : "text-[var(--ib-ink)]"
                    }`}
                  >
                    {t(tierDef.nameKey)}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                    {t(tierDef.descriptionKey)}
                  </p>

                  <div className="mt-5 flex flex-col items-center gap-2">
                    <p className="text-[13px] font-medium text-[var(--ib-mute)]">
                      <span className="line-through decoration-[var(--ib-mute)]">
                        ${annual}
                        {t("ltd.perYear", "/year")}
                      </span>
                      <span className="mx-1.5 text-[var(--ib-mute)]">→</span>
                      <span className="font-semibold text-[var(--ib-ink)]">
                        ${price} {t("ltd.oneTimeLabel", "one-time")}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1">
                      <span className="text-[40px] font-bold leading-none tracking-tight text-[var(--ib-ink)] sm:text-[48px] lg:text-[52px]">
                        ${price}
                      </span>
                      <span className="mb-1 max-w-[140px] text-left text-[12px] font-medium leading-snug text-[var(--ib-mute)] sm:text-[13px]">
                        {t("ltd.lifetimeAccess", "Lifetime Access")}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-[var(--ib-mute)] sm:text-[13px]">
                      {t(tierDef.subtextKey)}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex-grow text-left sm:mb-8">
                  <ul className="flex flex-col space-y-3.5 sm:space-y-4">
                    {tierDef.featureKeys.map((featureKey) => (
                      <li key={featureKey} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))] bg-[var(--ib-accbg)]">
                          <Check
                            className="size-3 text-[var(--ib-acc)]"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                        </div>
                        <p className="text-[13px] leading-relaxed text-[var(--ib-mute)]">
                          {t(featureKey)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex w-full shrink-0 flex-col items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleClaim(tierDef.tier)}
                    disabled={processingTier === tierDef.tier}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] py-4 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] disabled:cursor-not-allowed sm:py-[18px] sm:text-[13px] ${
                      isPopular
                        ? "bg-[var(--ib-acc)] text-white shadow-[0_12px_28px_-14px_rgba(27,77,219,0.55)] hover:opacity-95 active:scale-[0.98]"
                        : "border border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)] active:scale-[0.98]"
                    }`}
                  >
                    {processingTier === tierDef.tier ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                    ) : (
                      <>
                        <span className="text-center leading-snug">
                          {t(tierDef.ctaKey)}
                        </span>
                        <ArrowRight
                          className={`size-4 shrink-0 ${
                            isPopular ? "text-white" : "text-[var(--ib-mute)]"
                          }`}
                          aria-hidden
                        />
                      </>
                    )}
                  </button>
                  <p className="px-1 text-center text-[11px] font-medium leading-snug text-[var(--ib-mute)] sm:text-[12px]">
                    {t(
                      "ltd.trustMicrocopy",
                      "Pricing in USD · One-Time Payment · Lifetime Access · ISO 27001 & SOC2 Compliant",
                    )}
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

export default LtdPricingCards;
