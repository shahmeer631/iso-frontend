"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, CheckCircle2, Lock, CreditCard, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface MockCheckoutFormProps {
  isAdminPayment?: boolean;
}

export default function MockCheckoutForm({ isAdminPayment }: MockCheckoutFormProps) {
  const { lang } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill fields for a smooth sandbox experience
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/30");
  const [cvv, setCvv] = useState("123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Simulate server side authorization
    setTimeout(() => {
      if (!cardNumber || !expiry || !cvv) {
        setErrorMessage("Please fill in all card details for the sandbox checkout.");
        setIsLoading(false);
        setPaymentStatus("error");
        return;
      }

      setPaymentStatus("success");
      setIsLoading(false);

      toast.success(
        isAdminPayment
          ? "Admin sandbox checkout successful! Redirecting you..."
          : "Mock payment successful! Redirecting you now...",
        {
          description: "Your training plan has been activated successfully in test mode.",
        }
      );

      setTimeout(() => {
        window.location.href = `/${lang}/academy`;
      }, 2500);
    }, 1500);
  };

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-14 h-14 text-emerald-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Access Granted!</h2>
        <p className="text-gray-400 text-xl font-medium">
          {isAdminPayment ? "Admin Sandbox registration successful." : "Your mock purchase was successful."} Preparing your learning environment...
        </p>
        <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#1A1A1E] border border-white/5 rounded-full text-sm font-semibold text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          Redirecting to Academy...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Information Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" />
        <div>
          <span className="font-bold block">
            {isAdminPayment ? "Administrator Checkout Active" : "Sandbox Test Mode Active"}
          </span>
          <span className="text-amber-400/80">
            {isAdminPayment
              ? "Real payments are disabled for admin profiles to avoid live charges. Test credentials have been prefilled."
              : "This session is running in sandbox mode. Feel free to use test details to mock the transaction flow."}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trust Certification Logos */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-transparent flex items-center justify-center transition-transform hover:scale-110 duration-300">
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
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-transparent text-white border-none outline-none focus:ring-0 text-base placeholder-gray-500"
              placeholder="4242 4242 4242 4242"
            />
          </div>
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest"> Expiry Date </label>
            <div className="bg-[#0A0A0C] border-2 border-white/10 rounded-2xl p-5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 focus-within:bg-[#141416] shadow-sm">
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none focus:ring-0 text-base placeholder-gray-500"
                placeholder="MM/YY"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest"> CVV Code </label>
            <div className="bg-[#0A0A0C] border-2 border-white/10 rounded-2xl p-5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 focus-within:bg-[#141416] shadow-sm flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-transparent text-white border-none outline-none focus:ring-0 text-base placeholder-gray-500"
                  placeholder="123"
                />
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
            disabled={isLoading}
            className="w-full cursor-pointer bg-[#00f0ff] text-black py-5 rounded-[20px] font-black text-lg hover:bg-[#00f0ff] hover:shadow-2xl hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] ring-4 ring-cyan-500/5 shadow-xl shadow-cyan-500/10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Validating Test Session...
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

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/5 mt-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px]">Mock Sandbox Security Active</p>
        </div>
      </form>
    </div>
  );
}
