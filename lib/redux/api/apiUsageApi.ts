import { baseApi } from "./baseApi";

export type AssistantStepsStatus = {
  limit: number;
  used: number;
  remaining: number;
  unlimited: boolean;
};

export type ApiUsageStatus = {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string | null;
  windowStartAt: string | null;
  unlimited: boolean;
  /** Freemium Feature 4 — shared across Navigator / Audit Lens / Benchmark */
  assistantSteps?: AssistantStepsStatus;
};

export const apiUsageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiUsage: builder.query<
      { success: boolean; data: ApiUsageStatus; message: string },
      void
    >({
      query: () => ({
        url: "/api-usage",
        method: "GET",
      }),
      providesTags: ["ApiUsage"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetApiUsageQuery, useLazyGetApiUsageQuery } = apiUsageApi;
