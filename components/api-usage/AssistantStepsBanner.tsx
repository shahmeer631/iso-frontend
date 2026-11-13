"use client";

import { useGetApiUsageQuery } from "@/lib/redux/api/apiUsageApi";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";

/**
 * Shows remaining free AI Assistant steps (Navigator / Audit Lens / Benchmark).
 * Hidden for premium AI_ASSISTANT entitlement (unlimited).
 */
export default function AssistantStepsBanner() {
  const { data, isError } = useGetApiUsageQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const token = useSelector(selectCurrentToken);
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) || "en";

  const steps = data?.data?.assistantSteps;
  if (isError || !steps || steps.unlimited) return null;

  const exhausted = steps.remaining <= 0 && steps.used > 0;
  const from = encodeURIComponent(pathname || `/${lang}/ai-assistant`);

  return (
    <div
      className={`border-b px-4 py-2 text-center text-[12.5px] sm:text-[13px] ${
        exhausted
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)]"
      }`}
      role="status"
    >
      {exhausted ? (
        <span>
          You&apos;ve used all {steps.limit} free AI Assistant steps.{" "}
          <Link
            href={
              token
                ? `/${lang}/pricing?from=${from}`
                : `/${lang}/auth/login?from=${from}`
            }
            className="font-semibold underline underline-offset-2"
          >
            {token ? "Upgrade your plan to continue" : "Create a free account or log in"}
          </Link>
        </span>
      ) : (
        <span>
          You have{" "}
          <strong>
            {steps.remaining}/{steps.limit}
          </strong>{" "}
          free AI Assistant steps remaining
          {steps.used > 0 ? ` · ${steps.used} used` : ""}.
        </span>
      )}
    </div>
  );
}
