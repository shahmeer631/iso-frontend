"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useGoogleLoginMutation } from "@/lib/redux/features/auth/authApi";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/lib/i18n/client";

export default function GoogleLoginButton({ shortText }: { shortText?: boolean }) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const redirectParam = searchParams.get("redirect");
  const fromParam = searchParams.get("from");

  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

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

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const response = await googleLogin({ token: idToken }).unwrap();
      
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
      console.error("Google Login Backend Error:", err);
      toast.error(err?.data?.message || t("auth.loginError", "Login failed. Please try again."));
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.token) {
        const idToken = event.data.token;
        await handleGoogleLogin(idToken);
      } else if (event.data?.type === "GOOGLE_AUTH_FAILURE") {
        console.error("Google authentication failed:", event.data?.error);
        toast.error(t("auth.googleError", "Google authentication failed. Please try again."));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lang]);

  const handleButtonClick = () => {
    if (isLoading) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("your-google-client-id")) {
      console.error("Google Client ID is not configured in environment variables.");
      toast.error("Google Sign-In is not configured correctly. Missing Client ID.");
      return;
    }

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/${lang}/auth/google-callback`
    );
    const nonce = Math.random().toString(36).substring(2);
    
    // Google OAuth 2.0 endpoint for implicit flow (id_token)
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}`;

    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      oauthUrl,
      "GoogleLoginPopup",
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
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">
        {isLoading
          ? t("auth.signingIn", "Signing in...")
          : shortText
          ? "Google"
          : t("auth.continueWithGoogle", "Continue with Google")}
      </span>
    </button>
  );
}
