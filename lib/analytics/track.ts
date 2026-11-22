/**
 * Lightweight analytics helper — no third-party dependency.
 * Pushes to window.dataLayer when present (GTM/GA-compatible) and
 * dispatches a CustomEvent for local listeners.
 */

type TrackPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;

  const entry = {
    event,
    ...payload,
    ts: Date.now(),
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(entry);
  } catch {
    /* ignore */
  }

  try {
    window.dispatchEvent(
      new CustomEvent("isobrain:analytics", { detail: entry }),
    );
  } catch {
    /* ignore */
  }
}

export const MasteryAnalytics = {
  resultViewed: (extra?: TrackPayload) =>
    trackEvent("mastery_result_viewed", extra),
  ctaAcademy: (extra?: TrackPayload) =>
    trackEvent("mastery_cta_academy", extra),
  ctaLibrary: (extra?: TrackPayload) =>
    trackEvent("mastery_cta_library", extra),
  ctaAssistant: (extra?: TrackPayload) =>
    trackEvent("mastery_cta_assistant", extra),
};
