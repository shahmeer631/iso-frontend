"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, ArrowLeft, XCircle, CheckCircle2, Lock, CreditCard } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";

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

const elementStyles = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

export default function StripeCheckoutForm({ couponCode }: { couponCode?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("clientSecret");
  const isLive = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_");
  const isMock = !isLive && (searchParams.get("isMock") === "true" || clientSecret?.includes("mock"));

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [createSubscription] = useCreatePaymentIntentMutation();

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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isMock) {
      setIsLoading(true);
      setTimeout(() => {
        setPaymentStatus("success");
        setIsLoading(false);
        toast.success("Payment successful! Redirecting you now...", {
          description: "Your plan has been activated successfully.",
        });
        setTimeout(() => {
          window.location.href = `/${lang}/academy`;
        }, 2500);
      }, 1500);
      return;
    }

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    if (!clientSecret) {
      setErrorMessage("Payment session expired. Please restart the checkout.");
      setIsLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setErrorMessage("Payment elements not initialized properly.");
      setIsLoading(false);
      return;
    }

    let result;
    if (clientSecret.startsWith("seti_")) {
      result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
    } else {
      result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
    }

    const { error, paymentIntent, setupIntent } = result as any;

    if (error) {
      setErrorMessage(error.message ?? "An unexpected error occurred.");
      setPaymentStatus("error");
      setIsLoading(false);
    } else if (
      (paymentIntent && paymentIntent.status === "succeeded") ||
      (setupIntent && setupIntent.status === "succeeded")
    ) {
      const planId = searchParams.get("planId");

      if (setupIntent && setupIntent.payment_method) {
        try {
          const paymentMethodId = typeof setupIntent.payment_method === 'string' 
            ? setupIntent.payment_method 
            : setupIntent.payment_method.id;
            
          await createSubscription({
            planId: planId || "",
            userId: currentUserId || "",
            paymentMethodId: paymentMethodId,
            courseId: searchParams.get("courseId") || undefined,
            couponCode: couponCode,
          }).unwrap();
        } catch (error) {
          setErrorMessage("Failed to start subscription. Please contact support.");
          setPaymentStatus("error");
          setIsLoading(false);
          return;
        }
      }

      if (planId) {
        sessionStorage.setItem("just_purchased", planId);
      }
      setPaymentStatus("success");
      setIsLoading(false);
      toast.success("Payment successful! Redirecting you now...", {
        description: "Your plan has been activated successfully.",
      });
      // Use window.location.href for a full reload ensuring AuthHydrator re-fetches profile
      setTimeout(() => {
        window.location.href = `/${lang}/academy`;
      }, 2500);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-14 h-14 text-emerald-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Access Granted!</h2>
        <p className="text-gray-400 text-xl font-medium">Your purchase was successful. Preparing your learning environment...</p>
        <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#1A1A1E] border border-white/5 rounded-full text-sm font-semibold text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          Redirecting to Academy...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trust Certification Logos */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="  rounded-full overflow-hidden bg-transparent flex items-center justify-center transition-transform hover:scale-110 duration-300">
              <Image
                src={`/iso-${num}.png`}
                alt={`ISO Certification ${num}`}
                width={180}
                height={180}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* Card Number */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              Card Number
            </label>
            <div className="flex -space-x-1.5 grayscale opacity-40">
              <span className="text-[10px] font-black text-white italic mr-2">VISA</span>
              <div className="w-4 h-4 bg-[#EB001B] rounded-full"></div>
              <div className="w-4 h-4 bg-[#F79E1B] rounded-full opacity-80"></div>
            </div>
          </div>
          <div className="bg-[#0A0A0C] border-2 border-white/10 rounded-2xl p-5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 focus-within:bg-[#141416] shadow-sm">
            <CardNumberElement options={elementStyles} />
          </div>
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest"> Expiry Date </label>
            <div className="bg-[#0A0A0C] border-2 border-white/10 rounded-2xl p-5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 focus-within:bg-[#141416] shadow-sm">
              <CardExpiryElement options={elementStyles} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest"> CVV Code </label>
            <div className="bg-[#0A0A0C] border-2 border-white/10 rounded-2xl p-5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 focus-within:bg-[#141416] shadow-sm flex items-center justify-between">
              <div className="flex-1">
                <CardCvcElement options={elementStyles} />
              </div>
              <ShieldCheck className="w-4 h-4 text-gray-600 ml-2" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-6 py-4 animate-in slide-in-from-bottom-4">
            <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="font-semibold text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="w-full cursor-pointer bg-[#00f0ff] text-black py-5 rounded-[20px] font-black text-lg hover:bg-[#00f0ff] hover:shadow-2xl hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] ring-4 ring-cyan-500/5 shadow-xl shadow-cyan-500/10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Validating Transaction...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 border-2 border-black/20 rounded-md p-0.5" />
                Subscribe Now
              </>
            )}
          </button>

          {/* Security Combo Microcopy */}
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5 font-medium">
            🔒 Secure checkout. ISO 27001 & SOC2 compliant.
          </p>
        </div>

        {/* Security / SSL Footer */}
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/5 mt-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px]">Encrypted Secure Connection</p>
        </div>
      </form>
    </div>
  );
}
