"use client";

import { useGetApiUsageQuery } from "@/lib/redux/api/apiUsageApi";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";

/**
 * Global Feature 5 banner: 5 free website API calls / rolling 24h
 * for visitors and signed-up users (paid or unpaid). Hidden only for SUPER_ADMIN
 * (backend unlimited). Feature 4 assistant steps use AssistantStepsBanner.
 */
export default function ApiUsageBanner() {
  const { data, isError } = useGetApiUsageQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const token = useSelector(selectCurrentToken);
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) || "en";

  // Assistant pages show their own Feature 4 step banner; keep global daily strip elsewhere
  const onAssistantPage =
    typeof pathname === "string" &&
    (pathname.includes("/ai-assistant/iso-navigator") ||
      pathname.includes("/ai-assistant/audit-lens") ||
      pathname.includes("/ai-assistant/benchmark-ai"));

  const usage = data?.data;
  if (isError || !usage || usage.unlimited || onAssistantPage) return null;

  const resetsLabel = usage.resetsAt
    ? new Date(usage.resetsAt).toLocaleString()
    : null;
  const exhausted = usage.remaining <= 0 && usage.used > 0;
  const from = encodeURIComponent(pathname || `/${lang}`);

  return (
    <div
      className={`border-b px-4 py-2 text-center text-[12.5px] sm:text-[13px] ${
        exhausted
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-ink)]"
      }`}
      role="status"
    >
      {exhausted ? (
        <span>
          You&apos;ve used all {usage.limit} free API calls for this 24-hour
          period.
          {resetsLabel ? ` Renews ${resetsLabel}.` : ""}{" "}
          <Link
            href={
              token
                ? `/${lang}/pricing?from=${from}`
                : `/${lang}/auth/login?from=${from}`
            }
            className="font-semibold underline underline-offset-2"
          >
            {token
              ? "Upgrade your access to continue"
              : "Create a free account or log in"}
          </Link>
        </span>
      ) : (
        <span>
          You have{" "}
          <strong>
            {usage.remaining} of {usage.limit}
          </strong>{" "}
          free API calls remaining
          {resetsLabel ? ` · renews ${resetsLabel}` : ""}
        </span>
      )}
    </div>
  );
}
