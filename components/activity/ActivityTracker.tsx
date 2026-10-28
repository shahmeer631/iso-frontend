"use client";

import { useActivityHeartbeat } from "@/hooks/useActivityHeartbeat";
import type { ActivitySource } from "@/lib/redux/api/activityApi";

type Props = {
  source: ActivitySource;
  enabled?: boolean;
  courseId?: string | null;
  lessonId?: string | null;
  isoStandardId?: string | null;
  documentId?: string | null;
  aiToolId?: string | null;
  resourceLabel?: string | null;
  sessionKey?: string;
};

/** Headless tracker — mount inside authenticated learning / AI / library views. */
export function ActivityTracker(props: Props) {
  useActivityHeartbeat(props);
  return null;
}
