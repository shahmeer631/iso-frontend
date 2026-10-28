import { baseApi } from "./baseApi";

export type ActivitySource = "ACADEMY" | "LIBRARY" | "AI_TOOL";

export type AiToolId =
  | "ISO_NAVIGATOR"
  | "AUDIT_LENS"
  | "BENCHMARK_AI"
  | "ACADEMY_CHAT"
  | "LIBRARY_CHAT"
  | "UNIVERSAL_ASK";

export type HeartbeatPayload = {
  clientSessionId: string;
  source: ActivitySource;
  courseId?: string;
  lessonId?: string;
  isoStandardId?: string;
  documentId?: string;
  aiToolId?: AiToolId | string;
  resourceLabel?: string;
  path?: string;
  isVisible?: boolean;
};

export type HeartbeatResponse = {
  success: boolean;
  message: string;
  data: {
    accepted: boolean;
    creditedSeconds: number;
    session: {
      sessionId: string;
      clientSessionId: string;
      source: ActivitySource;
      status: string;
      activeSeconds: number;
      lastSeenAt: string;
    };
  };
};

export type ActivityResume = {
  source: ActivitySource;
  courseId?: string | null;
  lessonId?: string | null;
  isoStandardId?: string | null;
  documentId?: string | null;
  aiToolId?: string | null;
  resourceLabel?: string | null;
  path?: string | null;
  activitySessionId?: string | null;
  updatedAt?: string;
};

export type ActivityHistoryItem = {
  sessionId: string;
  clientSessionId: string;
  source: ActivitySource;
  status: string;
  courseId?: string | null;
  lessonId?: string | null;
  isoStandardId?: string | null;
  documentId?: string | null;
  aiToolId?: string | null;
  resourceLabel?: string | null;
  path?: string | null;
  startedAt: string;
  lastSeenAt: string;
  activeSeconds: number;
};

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postActivityHeartbeat: builder.mutation<HeartbeatResponse, HeartbeatPayload>({
      query: (body) => ({
        url: "/activity/heartbeat",
        method: "POST",
        body,
      }),
    }),
    getActivityResume: builder.query<
      { success: boolean; data: { resume: ActivityResume | null } },
      void
    >({
      query: () => ({
        url: "/activity/resume",
        method: "GET",
      }),
    }),
    getActivityHistory: builder.query<
      {
        success: boolean;
        meta?: { page: number; limit: number; total: number };
        data: ActivityHistoryItem[];
      },
      { page?: number; limit?: number; source?: ActivitySource } | void
    >({
      query: (params) => ({
        url: "/activity/history",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.source ? { source: params.source } : {}),
        },
      }),
    }),
  }),
});

export const {
  usePostActivityHeartbeatMutation,
  useGetActivityResumeQuery,
  useGetActivityHistoryQuery,
} = activityApi;
