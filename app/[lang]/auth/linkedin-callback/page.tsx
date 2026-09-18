"use client";

import { useEffect } from "react";

export default function LinkedInCallbackPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      let token = searchParams.get("code");
      let error = searchParams.get("error");
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        if (hashParams.get("code")) {
          token = hashParams.get("code");
        }
        if (hashParams.get("error")) {
          error = hashParams.get("error");
        }
      }

      if (token) {
        window.opener?.postMessage(
          { type: "LINKEDIN_AUTH_SUCCESS", token: token },
          window.location.origin
        );
        window.close();
      } else if (error) {
        window.opener?.postMessage(
          { type: "LINKEDIN_AUTH_FAILURE", error },
          window.location.origin
        );
        window.close();
      } else {
        console.warn("No token or error found in OAuth callback URL");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center font-sans text-white">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-t-[#00f0ff] border-[#27272A] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#A1A1AA] tracking-wider uppercase font-semibold">Completing LinkedIn authentication...</p>
      </div>
    </div>
  );
}
