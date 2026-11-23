import { baseApi } from '../api/baseApi';

// --- Types ---
export interface ISOCategory {
  id: string;
  name: string;
  slug: string;
  standardDesc?: string;
  description: string;
  standardSub?: string;
  courseDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISOStandard {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  isoCode: string;
  version: string;
  fileUrl: string;
  fileSize: number;
  downloads: number;
  categoryId: string;
  category: ISOCategory;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: ISOCategory[];
}

export interface ISOStandardsResponse {
  success: boolean;
  message: string;
  data: ISOStandard[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ISOStandardsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export interface ISOStandardResponse {
  success: boolean;
  message: string;
  data: ISOStandard;
}

export interface ISOChatResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    sources: string[];
    suggested_followups: string[];
    session_id: string;
  };
}

export interface ISOHistoryItem {
  id: string;
  role: "user" | "assistant";
  message: string | ISODeckData;
  sources: string[] | null;
  followUps: string[] | null;
  createdAt: string;
}

export interface ISOHistoryResponse {
  success: boolean;
  message: string;
  data: ISOHistoryItem[];
}

export interface ISOSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISOSessionsResponse {
  success: boolean;
  message: string;
  data: ISOSession[];
}

export interface ISOChatRequest {
  messages: string;
  context: string;
  session_id?: string;
  file?: File;
}

export interface SubmitAssessmentRequest {
  userId?: string | null;
  guestId?: string;
  /** Server-issued session id(s) from quiz generation (required for scoring) */
  examSessionId?: string;
  examSessionIds?: string[];
  timeTaken: number;
  metadata: {
    industry: string;
    management_level: string;
    department: string;
    suggestedStandards: string[];
  };
  answers: {
    questionId?: string;
    question: string;
    selected_answer: string;
    /** Untrusted — ignored by server scoring */
    correct_answer?: string;
  }[];
}

export interface SubmitAssessmentResponse {
  success: boolean;
  message: string;
  data: {
    id?: string;
    /** Present when anonymous submit succeeded but scores are gated */
    requiresAuth?: boolean;
    completed?: boolean;
    resultId?: string;
    userId?: string | null;
    guestId?: string;
    categoryId?: string;
    rightAns?: number;
    wrongAns?: number;
    total?: number;
    score?: number;
    overallScore?: number;
    /** Quiz progress % (answered / total) — separate from score */
    progress?: number;
    answered?: number;
    incorrectAns?: number;
    unanswered?: number;
    metrics?: {
      progress?: number;
      score?: number;
      correct?: number;
      incorrect?: number;
      unanswered?: number;
      answered?: number;
      total?: number;
    };
    compliance?: number;
    implementation?: number;
    auditing?: number;
    riskManagement?: number;
    governance?: number;
    createdAt?: string;
    formattedScore?: string;
    category?: string;
    weakAreas?: string[];
    suggestions?: string[];
    industry?: string;
    management_level?: string;
    department?: string;
    benchmark?: {
      industryAverage?: number;
      comparison?: string;
    };
    aiFeedback?: {
      overall_score: string;
      competency_level: {
        code: string;
        title: string;
        summary: string;
      };
      analytical_feedback: {
        strengths: string[];
        weaknesses: string[];
        critical_focus_clauses: string[];
      };
      risk_assessment: {
        risk_level: string;
        impact_description: string;
        mitigation_recommendation: string;
      };
      learning_roadmap: {
        area: string;
        priority: string;
        resources: string[];
        action_item: string;
      }[];
      mentor_closing_note: string;
    };
    weakStandards?: string[];
    passed?: boolean;
  };
}

// --- Leaderboard Types ---
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  category?: string;
  industry?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: LeaderboardEntry[];
}

export interface ISOCard {
  front: {
    title: string;
    body: string;
  };
  back: {
    title: string;
    body: string;
  };
}

export interface ISODeckData {
  deck_title: string;
  iso_standard: string;
  total_cards: number;
  difficulty: string;
  cards: ISOCard[];
  generated_at: string;
  session_id: string;
}

export interface ISOFlashcardsResponse {
  success: boolean;
  message: string;
  data: ISODeckData;
}

export const isoStandardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => ({ url: '/categories' }),
      providesTags: ['Categories'],
    }),
    getISOStandards: builder.query<ISOStandardsResponse, ISOStandardsQueryParams | void>({
      query: (params) => ({
        url: '/iso-standards',
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          categoryId: params?.categoryId,
        },
      }),
      providesTags: ['ISOStandards'],
    }),
    getISOStandardById: builder.query<ISOStandardResponse, string>({
      query: (id) => ({ url: `/iso-standards/${id}` }),
      providesTags: ['ISOStandards'],
    }),

    chatWithISOStandards: builder.mutation<ISOChatResponse, ISOChatRequest>({
      query: (body) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ChatSessions', 'ApiUsage'],
    }),


    generateFlashcards: builder.mutation<ISOFlashcardsResponse, FormData>({
      query: (body) => ({
        url: '/ai-assistant/flashcards',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ApiUsage'],
    }),
    chatWithISOStandardsNew: builder.mutation<ISOChatResponse, ISOChatRequest>({
      query: (body) => ({
        url: '/ai-assistant/library/chat',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ChatSessions', 'ApiUsage'],
    }),





    generateFlashcardsNew: builder.mutation<ISOFlashcardsResponse, FormData>({
      query: (body) => ({
        url: '/ai-assistant/library/flashcards',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ApiUsage'],
    }),



    getChatHistory: builder.query<ISOHistoryResponse, string>({
      query: (sessionId) => ({
        url: `/ai-assistant/history/${sessionId}`,
      }),
    }),
    getChatSessions: builder.query<ISOSessionsResponse, string>({
      query: (standardId) => ({
        url: `/ai-assistant/sessions/${standardId}`,
      }),
      providesTags: ['ChatSessions'],
    }),
    submitAssessment: builder.mutation<SubmitAssessmentResponse, SubmitAssessmentRequest>({
      query: (body) => ({
        url: '/mastery-labs/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaderboard'],
    }),
    getMasteryLabResult: builder.query<SubmitAssessmentResponse, string>({
      query: (resultId) => ({
        url: `/mastery-labs/results/${resultId}`,
      }),
    }),
    claimMasteryLabResult: builder.mutation<
      SubmitAssessmentResponse,
      { resultId: string; guestId: string }
    >({
      query: (body) => ({
        url: '/mastery-labs/claim',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaderboard'],
    }),
    getLeaderboard: builder.query<
      LeaderboardResponse,
      | void
      | {
          filter?: 'global' | 'industry' | 'management_level';
          industry?: string;
          management_level?: string;
        }
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && typeof args === 'object') {
          if (args.filter) params.set('filter', args.filter);
          if (args.industry) params.set('industry', args.industry);
          if (args.management_level)
            params.set('management_level', args.management_level);
        }
        const qs = params.toString();
        return {
          url: qs
            ? `/mastery-labs/leaderboard?${qs}`
            : '/mastery-labs/leaderboard',
        };
      },
      providesTags: ['Leaderboard'],
      // After admin campaign/leaderboard reset there is no client mutation to
      // invalidate this tag — remount/focus must refetch so soft-hidden ranks
      // do not linger from RTK cache.
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useGetISOStandardsQuery,
  useGetISOStandardByIdQuery,
  useChatWithISOStandardsMutation,
  useGenerateFlashcardsMutation,
  useChatWithISOStandardsNewMutation,
  useGenerateFlashcardsNewMutation,
  useGetChatHistoryQuery,
  useGetChatSessionsQuery,
  useSubmitAssessmentMutation,
  useGetMasteryLabResultQuery,
  useLazyGetMasteryLabResultQuery,
  useClaimMasteryLabResultMutation,
  useGetLeaderboardQuery,
} = isoStandardsApi;