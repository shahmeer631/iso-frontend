"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripeCheckoutForm from "@/components/payments/StripeCheckoutForm";
import MockCheckoutForm from "@/components/payments/MockCheckoutForm";
import { ArrowLeft, ShieldCheck, CheckCircle2, Zap, Lock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useValidateCouponMutation, useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { toast } from "sonner";
import "@/lib/i18n/client";

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

function PaymentPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialClientSecret = searchParams.get("clientSecret");
  const [clientSecret, setClientSecret] = React.useState(initialClientSecret);
  const planName = searchParams.get("planName") || "Premium Plan";
  const [price, setPrice] = React.useState(searchParams.get("price") || "0");
  const originalPrice = searchParams.get("originalPrice") || "0";
  const planId = searchParams.get("planId");
  const courseId = searchParams.get("courseId");

  const isLive = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_");
  const isMock = !isLive && (searchParams.get("isMock") === "true" || clientSecret?.includes("mock"));
  const isAdminPayment = !isLive && searchParams.get("isAdminPayment") === "true";

  const [savings, setSavings] = React.useState(parseFloat(originalPrice) - parseFloat(price));

  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);

  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
  const [createPaymentIntent, { isLoading: isCreatingIntent }] = useCreatePaymentIntentMutation();

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    const currentUserId = getUserId();
    if (!currentUserId || !planId) {
      toast.error("Missing user or plan information.");
      return;
    }

    try {
      const res = await validateCoupon({
        code: couponInput.trim(),
        planId: planId,
        userId: currentUserId,
      }).unwrap();

      if (res.success && res.data) {
        const intentRes = await createPaymentIntent({
          planId: planId,
          userId: currentUserId,
          courseId: courseId || undefined,
          couponCode: res.data.code,
        }).unwrap();

        if (intentRes.success && intentRes.data?.clientSecret) {
          setClientSecret(intentRes.data.clientSecret);
          setPrice(res.data.finalAmount.toString());
          setSavings(parseFloat(originalPrice) - res.data.finalAmount);
          setAppliedCoupon(res.data.code);
          toast.success("Coupon applied successfully!");
        } else {
          toast.error("Failed to apply discount to checkout.");
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid coupon code");
    }
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0C]">
        <div className="bg-[#141416] rounded-2xl shadow-xl p-10 text-center max-w-md w-full border border-white/5">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 opacity-40" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 capitalize">{t('payment.invalidCheckout')}</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{t('payment.noSessionFound')}</p>
          <button
            onClick={() => router.push(`/${t('lang')}/pricing`)}
            className="flex items-center gap-2 mx-auto bg-cyan-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('payment.goToPricing')}
          </button>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#06b6d4",
      colorBackground: "#141416",
      colorText: "#ffffff",
      colorDanger: "#ef4444",
      fontFamily: "Space Grotesk, system-ui, sans-serif",
      borderRadius: "16px",
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-25">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] left-[0%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">

        {/* Left Side: Order Summary (5 Columns) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8 animate-in slide-in-from-left-4 duration-700">
          <div>
            <button
              onClick={() => router.back()}
              className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('payment.backToChoice')}
            </button>
            <h1 className="text-4xl font-black text-white tracking-tight mb-4">{t('payment.completePurchasePart1')} <span className="text-[#00f0ff]">{t('payment.completePurchasePart2')}</span></h1>
            <p className="text-gray-400 text-lg leading-relaxed">{t('payment.joinThousands')}</p>
          </div>

          <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 text-[#00f0ff] rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 " />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg capitalize">{planName} {t('payment.pack')}</h3>
                  <p className="text-sm text-gray-400">{t('payment.lifetimeAccess')}</p>
                </div>
              </div>
              <span className="font-bold text-xl text-white">${price}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>{t('payment.subtotal')}</span>
                <span className="line-through">{t('payment.was')} ${originalPrice}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>{t('payment.discountApplied')}</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-black text-2xl pt-4 border-t border-white/10">
                <span>{t('payment.totalAmount')}</span>
                <span>${price} <span className="text-sm font-medium text-gray-500 ml-1">/{t('payment.oneTime')}</span></span>
              </div>
            </div>

            {/* Coupon Code Section */}
            {!isMock && (
              <div className="mb-8 pt-6 border-t border-white/10">
                <label className="block text-sm font-bold text-gray-400 mb-2">Have a coupon code?</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon || isValidating || isCreatingIntent}
                    className="flex-1 w-full min-w-0 bg-[#0A0A0C] border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || !!appliedCoupon || isValidating || isCreatingIntent}
                    className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px] w-full sm:w-auto shrink-0"
                  >
                    {isValidating || isCreatingIntent ? <Loader2 className="w-5 h-5 animate-spin" /> : appliedCoupon ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('payment.noHiddenFees')}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('payment.instantAccess')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#141416]/80 rounded-2xl border border-white/5">
            <div className="w-10 h-10 text-[#00f0ff] rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-[13px] text-gray-400 leading-tight">
              {t('payment.securityNote')}
            </p>
          </div>
        </div>

        {/* Right Side: Payment Form (7 Columns) */}
        <div className="lg:col-span-12 xl:col-span-7 animate-in slide-in-from-right-4 duration-700">
          <div className="bg-[#141416] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-[#00f0ff]   p-12 text-center text-[#141416] relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">{t('payment.secureCheckout')}</h2>
                <p className="text-sm text-[#141416]">{t('payment.safeEncrypted')}</p>
              </div>
            </div>
            <div className="p-8 md:p-12">
              {isMock ? (
                <MockCheckoutForm isAdminPayment={isAdminPayment} />
              ) : (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: clientSecret || undefined,
                    appearance,
                  }}
                >
                  <StripeCheckoutForm couponCode={appliedCoupon || undefined} />
                </Elements>
              )}
            </div>
          </div>
          <p className="text-center mt-8 text-sm text-gray-500 font-medium">{t('payment.poweredByStripe')}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentPageFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0C]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-[5px] border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold tracking-widest uppercase animate-pulse">{t('payment.initializingCheckout')}</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={<PaymentPageFallback />}
    >
      <PaymentPageContent />
    </Suspense>
  );
}
