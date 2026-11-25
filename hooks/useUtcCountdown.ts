"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCountdownParts,
  serverAlignedNowMs,
  type CountdownParts,
} from "@/lib/lifetimeDeal/countdown";

/**
 * Single-interval UTC countdown bound to a shared backend deadline.
 * - Does not reset on refresh (deadline comes from API `endsAt`)
 * - Optionally skew-corrects using API `serverTime`
 * - Cleans up the interval on unmount / deadline change
 * - Reports expired when remaining ≤ 0
 * - Display only — checkout/eligibility use backend UTC
 */
export function useUtcCountdown(
  endsAtIso: string | null | undefined,
  serverTimeIso?: string | null,
): CountdownParts {
  const fetchedAtRef = useRef(Date.now());
  const [parts, setParts] = useState<CountdownParts>(() =>
    getCountdownParts(
      endsAtIso,
      serverAlignedNowMs(serverTimeIso, Date.now(), fetchedAtRef.current),
    ),
  );
  const endsAtRef = useRef(endsAtIso);
  endsAtRef.current = endsAtIso;
  const serverTimeRef = useRef(serverTimeIso);
  serverTimeRef.current = serverTimeIso;

  useEffect(() => {
    fetchedAtRef.current = Date.now();
    const now = serverAlignedNowMs(
      serverTimeIso,
      Date.now(),
      fetchedAtRef.current,
    );
    setParts(getCountdownParts(endsAtIso, now));

    if (!endsAtIso) return;

    const endMs = Date.parse(endsAtIso);
    if (Number.isNaN(endMs) || endMs <= now) {
      setParts(getCountdownParts(endsAtIso, now));
      return;
    }

    const tick = () => {
      const aligned = serverAlignedNowMs(
        serverTimeRef.current,
        Date.now(),
        fetchedAtRef.current,
      );
      setParts(getCountdownParts(endsAtRef.current, aligned));
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAtIso, serverTimeIso]);

  return parts;
}
