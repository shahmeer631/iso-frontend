"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLinkedinLoginMutation } from "@/lib/redux/features/auth/authApi";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/lib/i18n/client";

export default function LinkedInLoginButton({ shortText }: { shortText?: boolean }) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");

  const [linkedinLogin, { isLoading }] = useLinkedinLoginMutation();

  const resolveSafeRedirect = () => {
    const rawTarget = redirectParam || fromParam;
    if (!rawTarget) return null;
    let decodedTarget = rawTarget;
    try {
      decodedTarget = decodeURIComponent(rawTarget);
    } catch {
      return null;
    }
    if (!decodedTarget.startsWith("/") || decodedTarget.startsWith("//")) return null;
    return decodedTarget;
  };

  const handleLinkedinLogin = async (token: string) => {
    try {
      const response = await linkedinLogin({ token }).unwrap();
      
      const accessToken =
        response?.data?.accessToken ||
        response?.accessToken ||
        response?.data?.token ||
        response?.token;
      const refreshToken = response?.data?.refreshToken || response?.refreshToken;

      if (accessToken) {
        document.cookie = `token=${accessToken}; path=/; max-age=31536000`;
        if (refreshToken) {
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=31536000`;
        }

        const userData = response.user || response?.data?.user || response?.data || response;
        const formattedUser = (userData && (userData.id || userData._id || userData.userId))
          ? {
              id: userData.id || userData._id || userData.userId,
              email: userData.email,
              name: userData.name || userData.fullName || userData.username || "",
              role: userData.role || "USER",
            }
          : null;

        dispatch(
          setCredentials({
            user: formattedUser as any,
            token: accessToken,
            refreshToken: refreshToken || null,
          })
        );

        const safeRedirect = resolveSafeRedirect();
        if (safeRedirect) {
          router.push(safeRedirect);
          return;
        }
        
        router.push(`/${lang}/academy${courseId ? `?courseId=${courseId}` : ""}`);
        toast.success(t("auth.loginSuccess", "Login successful!"));
      } else {
        toast.error(t("auth.loginError", "Authentication failed. Token not returned."));
      }
    } catch (err: any) {
      console.error("LinkedIn Login Backend Error:", err);
      toast.error(err?.data?.message || t("auth.loginError", "Login failed. Please try again."));
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "LINKEDIN_AUTH_SUCCESS" && event.data?.token) {
        const token = event.data.token;
        await handleLinkedinLogin(token);
      } else if (event.data?.type === "LINKEDIN_AUTH_FAILURE") {
        console.error("LinkedIn authentication failed:", event.data?.error);
        toast.error(t("auth.linkedinError", "LinkedIn authentication failed. Please try again."));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lang]);

  const handleButtonClick = () => {
    if (isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    if (!clientId || clientId.includes("your-linkedin-client-id")) {
      console.error("LinkedIn Client ID is not configured in environment variables.");
      toast.error("LinkedIn Sign-In is not configured correctly. Missing Client ID.");
      return;
    }

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/${lang}/auth/linkedin-callback`
    );
    const nonce = Math.random().toString(36).substring(2);
    
    // LinkedIn OAuth 2.0 endpoint (usually uses response_type=code, but matching structure)
    const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress&state=${nonce}`;

    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      oauthUrl,
      "LinkedinLoginPopup",
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
    );
  };

  return (
    <button
      onClick={handleButtonClick}
      disabled={isLoading}
      type="button"
      className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:bg-[#27272A] transition-all group disabled:opacity-50 cursor-pointer"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
        </svg>
      )}
      <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">
        {isLoading
          ? t("auth.signingIn", "Signing in...")
          : shortText
          ? "LinkedIn"
          : t("auth.continueWithLinkedIn", "Continue with LinkedIn")}
      </span>
    </button>
  );
}
