"use client";

import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      let idToken = searchParams.get("id_token");
      let error = searchParams.get("error");
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        if (hashParams.get("id_token")) {
          idToken = hashParams.get("id_token");
        }
        if (hashParams.get("error")) {
          error = hashParams.get("error");
        }
      }

      if (idToken) {
        window.opener?.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS", token: idToken },
          window.location.origin
        );
        window.close();
      } else if (error) {
        window.opener?.postMessage(
          { type: "GOOGLE_AUTH_FAILURE", error },
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
        <p className="text-sm text-[var(--ib-mute)] tracking-wider uppercase font-semibold">Completing Google authentication...</p>
      </div>
    </div>
  );
}
