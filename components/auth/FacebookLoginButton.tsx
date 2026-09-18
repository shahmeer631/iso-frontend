"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFacebookLoginMutation } from "@/lib/redux/features/auth/authApi";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/lib/i18n/client";

export default function FacebookLoginButton({ shortText }: { shortText?: boolean }) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");

  const [facebookLogin, { isLoading }] = useFacebookLoginMutation();

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

  const handleFacebookLogin = async (token: string) => {
    try {
      const response = await facebookLogin({ token }).unwrap();
      
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
      console.error("Facebook Login Backend Error:", err);
      toast.error(err?.data?.message || t("auth.loginError", "Login failed. Please try again."));
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "FACEBOOK_AUTH_SUCCESS" && event.data?.token) {
        const token = event.data.token;
        await handleFacebookLogin(token);
      } else if (event.data?.type === "FACEBOOK_AUTH_FAILURE") {
        console.error("Facebook authentication failed:", event.data?.error);
        toast.error(t("auth.facebookError", "Facebook authentication failed. Please try again."));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lang]);

  const handleButtonClick = () => {
    if (isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    if (!clientId || clientId.includes("your-facebook-client-id")) {
      console.error("Facebook Client ID is not configured in environment variables.");
      toast.error("Facebook Sign-In is not configured correctly. Missing Client ID.");
      return;
    }

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/${lang}/auth/facebook-callback`
    );
    const nonce = Math.random().toString(36).substring(2);
    
    // Facebook OAuth 2.0 endpoint
    const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile&state=${nonce}`;

    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      oauthUrl,
      "FacebookLoginPopup",
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
        <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
          <path
            fill="#1877F2"
            d="M24 12a12 12 0 1 1-24 0 12 12 0 0 1 24 0z"
          />
          <path
            fill="#FFF"
            d="M14 12h-3v8H8v-8H6V9.5h2v-2c0-2 1.2-3 3-3 .9 0 1.6.1 1.8.1v2.1h-1.2c-1 0-1.2.5-1.2 1.2v1.6h3l-.4 2.5z"
          />
        </svg>
      )}
      <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">
        {isLoading
          ? t("auth.signingIn", "Signing in...")
          : shortText
          ? "Facebook"
          : t("auth.continueWithFacebook", "Continue with Facebook")}
      </span>
    </button>
  );
}
