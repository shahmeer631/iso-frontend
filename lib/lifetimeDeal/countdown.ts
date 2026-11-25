export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  expired: boolean;
};

/**
 * Compute remaining time until a UTC ISO deadline.
 * Uses a single shared deadline — never invents or resets local timers.
 */
export function getCountdownParts(
  endsAtIso: string | null | undefined,
  nowMs: number = Date.now(),
): CountdownParts {
  if (!endsAtIso) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      expired: true,
    };
  }

  const endMs = Date.parse(endsAtIso);
  if (Number.isNaN(endMs)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      expired: true,
    };
  }

  const totalMs = Math.max(0, endMs - nowMs);
  const expired = totalMs <= 0;
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalMs, expired };
}

export function pad2(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

/** True when LTD purchase UI should show (backend ACTIVE + purchasable). */
export function isLtdOfferLive(status?: {
  status?: string;
  isPurchasable?: boolean;
  pricingMode?: string;
} | null): boolean {
  if (status?.pricingMode === "ANNUAL") return false;
  return status?.status === "ACTIVE" && status?.isPurchasable === true;
}

/** True when pricing should fall back to annual plans. */
export function shouldShowAnnualPricing(status?: {
  status?: string;
  isPurchasable?: boolean;
  pricingMode?: string;
} | null): boolean {
  if (!status) return true;
  if (status.pricingMode === "ANNUAL") return true;
  if (status.status === "EXPIRED" || status.status === "DISABLED") return true;
  if (status.status === "SCHEDULED") return true;
  return !isLtdOfferLive(status);
}

/**
 * Align local countdown with backend UTC using serverTime from the status DTO.
 * Enforcement still happens server-side; this only reduces UI clock skew.
 */
export function serverAlignedNowMs(
  serverTimeIso: string | null | undefined,
  localNowMs: number = Date.now(),
  fetchedAtLocalMs?: number,
): number {
  if (!serverTimeIso) return localNowMs;
  const serverMs = Date.parse(serverTimeIso);
  if (Number.isNaN(serverMs)) return localNowMs;
  const anchor = fetchedAtLocalMs ?? localNowMs;
  const skew = serverMs - anchor;
  return localNowMs + skew;
}

/**
 * Polling interval for status refetch while LTD is live.
 * Near expiry, poll more often so UI restores annual without a manual visit.
 */
export function ltdStatusPollingIntervalMs(remainingMs: number | null | undefined): number {
  if (remainingMs == null || remainingMs <= 0) return 0;
  if (remainingMs <= 15_000) return 2_000;
  if (remainingMs <= 60_000) return 5_000;
  if (remainingMs <= 5 * 60_000) return 15_000;
  return 30_000;
}
