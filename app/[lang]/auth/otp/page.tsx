"use client";

import { useState, useRef, KeyboardEvent, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useVerifyOtpMutation } from "@/lib/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/lib/i18n/client";

const OTPContent = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const dispatch = useDispatch();

  const [verifyOtp, { isLoading, isError }] = useVerifyOtpMutation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);

      const nextFocus = Math.min(index + pasted.length, 5);
      inputRefs[nextFocus].current?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (!email) {
      console.error("No email found in URL");
      return;
    }

    try {
      const response = await verifyOtp({
        email,
        otp: otpValue,
        purpose: "EMAIL_VERIFY"
      }).unwrap();

      // Extract the setupToken from the backend response
      const setupToken = response?.data?.setupToken || response?.setupToken;
      if (setupToken) {
        // Temporarily store the setup token so the complete-profile PUT request authorizes perfectly!
        // Added path=/ to ensure it's available globaly across segments
        document.cookie = `token=${setupToken}; path=/; max-age=3600`;

        // Update Redux immediately so baseApi catches it in the Authorization header
        dispatch(
          setCredentials({
            user: {
              id: "000000000000000000000000", 
              email,
              purchasedPlanIds: []
            },
            token: setupToken,
            refreshToken: null,
          })
        );
      }

      // Navigate to complete-profile page without reload
      const locale = lang || 'en';
      router.push(`/${locale}/auth/complete-profile?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Failed to verify OTP:", err);
      toast.error(err?.data?.message || t('auth.invalidCode', 'Invalid code. Please try again.'));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="bg-linear-to-r from-[#7C3AED] to-[#4F46E5] text-primary-foreground h-10 w-10 rounded-lg flex items-center justify-center">
            <span className="font-bold text-xl text-white">{t('dynamic.dyn_iB_547')}</span>
          </div>
          <span className="font-bold text-[#101828] text-2xl">ISOBrain.ai</span>
        </div>

        <Card className="border-none shadow-lg shadow-gray-300">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-[#101828]">
              {t('auth.checkEmail')}
            </CardTitle>
            <CardDescription className="text-[#4A5565]">
              {t('auth.sentCodeTo')} <span className="font-semibold text-gray-800">{email || "your email"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8 mb-4">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl border-[#5046E5] focus:border-[#5046E5] focus:ring-2 focus:ring-[#5046E5]/20 focus:outline-none transition-all bg-muted/30 text-gray-900"
                  />
                ))}
              </div>

              {isError && (
                <div className="text-red-500 text-sm font-medium text-center">
                  {t('auth.invalidCode')}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={otp.join("").length !== 6 || isLoading || !email}
                  className="w-full h-11 text-md bg-[#5046E5] hover:bg-[#4338ca] disabled:opacity-75"
                >
                  {isLoading ? t('auth.verifying') : t('auth.verifyEmail')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center text-sm font-medium text-gray-600">
                  {t('auth.didntReceiveCode')}{" "}
                  <button type="button" className="text-[#5046E5] hover:underline font-semibold">
                    {t('auth.clickToResend')}
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>
            {t('auth.byContinuing')}{" "}
            <Link href="#" className="text-[#5046E5] hover:underline">
              {t('auth.termsOfService')}
            </Link>{" "}
            {t('auth.and')}{" "}
            <Link href="#" className="text-[#5046E5] hover:underline">
              {t('auth.privacyPolicy')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const OTPPage = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex justify-center items-center">
        <div className="text-gray-500 font-medium tracking-wide">{t('auth.loadingVerification')}</div>
      </div>
    }>
      <OTPContent />
    </Suspense>
  );
};

export default OTPPage;
