"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import {
  ActivitySource,
  usePostActivityHeartbeatMutation,
} from "@/lib/redux/api/activityApi";

const HEARTBEAT_MS = 15_000;

type UseActivityHeartbeatArgs = {
  source: ActivitySource;
  enabled?: boolean;
  courseId?: string | null;
  lessonId?: string | null;
  isoStandardId?: string | null;
  documentId?: string | null;
  aiToolId?: string | null;
  resourceLabel?: string | null;
  /** Stable key for sessionStorage session id (per context). */
  sessionKey?: string;
};

const newUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getOrCreateClientSessionId = (storageKey: string) => {
  if (typeof window === "undefined") return newUuid();
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const id = newUuid();
    sessionStorage.setItem(storageKey, id);
    return id;
  } catch {
    return newUuid();
  }
};

/**
 * Sends authenticated activity heartbeats while the page is eligible.
 * - One interval per mounted hook instance
 * - Serializes requests so visibility/unmount pulses are not dropped while in-flight
 * - Skips when unauthenticated or disabled
 * - Does not retry unboundedly on failure (single attempt per queued pulse)
 */
export function useActivityHeartbeat(args: UseActivityHeartbeatArgs) {
  const token = useSelector(selectCurrentToken);
  const [postHeartbeat] = usePostActivityHeartbeatMutation();
  const argsRef = useRef(args);
  argsRef.current = args;

  const queueRef = useRef<Array<boolean>>([]);
  const drainingRef = useRef(false);
  const postRef = useRef(postHeartbeat);
  postRef.current = postHeartbeat;
  const clientSessionIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const enabled = args.enabled !== false;
    if (!enabled || !token) return;

    const storageKey =
      args.sessionKey ||
      `ib_activity_${args.source}_${args.courseId || args.isoStandardId || args.aiToolId || "default"}`;

    clientSessionIdRef.current = getOrCreateClientSessionId(storageKey);

    const drain = async () => {
      if (drainingRef.current) return;
      drainingRef.current = true;
      try {
        while (queueRef.current.length > 0) {
          // Collapse to the latest visibility intent while preserving order of distinct pulses
          const isVisible = queueRef.current.shift() as boolean;
          // Coalesce consecutive duplicates
          while (
            queueRef.current.length > 0 &&
            queueRef.current[0] === isVisible
          ) {
            queueRef.current.shift();
          }

          const current = argsRef.current;
          const clientSessionId = clientSessionIdRef.current;
          if (!clientSessionId) continue;

          try {
            await postRef.current({
              clientSessionId,
              source: current.source,
              ...(current.courseId ? { courseId: current.courseId } : {}),
              ...(current.lessonId ? { lessonId: current.lessonId } : {}),
              ...(current.isoStandardId
                ? { isoStandardId: current.isoStandardId }
                : {}),
              ...(current.documentId ? { documentId: current.documentId } : {}),
              ...(current.aiToolId ? { aiToolId: current.aiToolId } : {}),
              ...(current.resourceLabel
                ? { resourceLabel: current.resourceLabel }
                : {}),
              path:
                typeof window !== "undefined"
                  ? window.location.pathname
                  : undefined,
              isVisible,
            }).unwrap();
          } catch {
            // Swallow — avoid toast spam; next interval may succeed
          }
        }
      } finally {
        drainingRef.current = false;
        // A pulse may have been enqueued while we were finishing
        if (queueRef.current.length > 0) {
          void drain();
        }
      }
    };

    const enqueue = (isVisible: boolean) => {
      queueRef.current.push(isVisible);
      // Cap queue length to avoid unbounded growth on flaky networks
      if (queueRef.current.length > 4) {
        queueRef.current = queueRef.current.slice(-2);
      }
      void drain();
    };

    // Initial pulse
    enqueue(typeof document === "undefined" ? true : !document.hidden);

    const intervalId = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      enqueue(true);
    }, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.hidden) {
        enqueue(false);
      } else {
        enqueue(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      // Final idle pulse — queued so it is not dropped by an in-flight request
      enqueue(false);
    };
  }, [
    token,
    args.enabled,
    args.source,
    args.courseId,
    args.lessonId,
    args.isoStandardId,
    args.documentId,
    args.aiToolId,
    args.sessionKey,
  ]);
}
