"use client";

import Link from "next/link";
import { CheckCircle2, LogIn, UserPlus } from "lucide-react";

type AssessmentResultGateProps = {
  lang: string;
  /** Absolute in-app path to return to after auth (must start with /) */
  returnPath: string;
};

/**
 * Shown after an anonymous Mastery Lab submission.
 * Results stay on the server until the visitor signs in / registers.
 */
export default function AssessmentResultGate({
  lang,
  returnPath,
}: AssessmentResultGateProps) {
  const safeReturn =
    returnPath.startsWith("/") && !returnPath.startsWith("//")
      ? returnPath
      : `/${lang}/mastery-lab/success-evaluation`;
  const encoded = encodeURIComponent(safeReturn);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-8 sm:p-10 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ib-acc)]/10 text-[var(--ib-acc)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ib-ink)] mb-3">
          Your Assessment Is Complete!
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--ib-mute)] mb-2">
          Your results are ready.
        </p>
        <p className="text-[14px] leading-relaxed text-[var(--ib-mute)] mb-8">
          Create a free account or log in to view your assessment score and
          results. No premium subscription is required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${lang}/auth/sign-up?from=${encoded}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ib-acc)] px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus className="h-4 w-4" />
            Create Free Account
          </Link>
          <Link
            href={`/${lang}/auth/login?from=${encoded}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-5 py-3 text-sm font-bold text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
