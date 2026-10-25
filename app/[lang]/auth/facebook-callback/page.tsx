"use client";

import { useEffect } from "react";

export default function FacebookCallbackPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      let token = searchParams.get("access_token");
      let error = searchParams.get("error");
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        if (hashParams.get("access_token")) {
          token = hashParams.get("access_token");
        }
        if (hashParams.get("error")) {
          error = hashParams.get("error");
        }
      }

      if (token) {
        window.opener?.postMessage(
          { type: "FACEBOOK_AUTH_SUCCESS", token: token },
          window.location.origin
        );
        window.close();
      } else if (error) {
        window.opener?.postMessage(
          { type: "FACEBOOK_AUTH_FAILURE", error },
          window.location.origin
        );
        window.close();
      } else {
        console.warn("No token or error found in OAuth callback URL");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] flex items-center justify-center font-sans text-[var(--ib-ink)]">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-t-[var(--ib-acc)] border-[var(--ib-line)] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--ib-mute)] tracking-wider uppercase font-semibold">Completing Facebook authentication...</p>
      </div>
    </div>
  );
}
