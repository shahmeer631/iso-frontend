import { baseApi } from '../api/baseApi';
import { 
  BenchmarkResponse, 
  BenchmarkTextRequest,
  ISOSuggestionsResponse
} from '@/types/benchmark';

export const benchmarkApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    analyzeFile: builder.mutation<BenchmarkResponse, FormData>({
      query: (formData) => ({
        url: '/ai-assistant/benchmark/analyze-file',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ApiUsage'],
    }),
    analyzeText: builder.mutation<BenchmarkResponse, BenchmarkTextRequest>({
      query: (data) => ({
        url: '/ai-assistant/benchmark/analyze-text',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApiUsage'],
    }),
    getISOSuggestions: builder.mutation<ISOSuggestionsResponse, FormData>({
      query: (formData) => ({
        url: '/ai-assistant/benchmark-ai/iso-suggestions',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ApiUsage'],
    }),
    chatSimple: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/chat-simple',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ApiUsage', 'ChatSessions'],
    }),
    getBenchmarkChatSessions: builder.query<
      Array<{
        id: string;
        title?: string | null;
        createdAt: string;
        updatedAt: string;
      }>,
      void
    >({
      query: () => ({
        url: '/ai-assistant/sessions',
        params: { purpose: 'benchmark_ai' },
      }),
      transformResponse: (response: any) => {
        const rows = response?.data || response || [];
        return Array.isArray(rows) ? rows : [];
      },
      providesTags: ['ChatSessions'],
    }),
    getBenchmarkChatHistory: builder.query<
      Array<{
        id: string;
        role: string;
        message: string;
        sources?: any;
        createdAt: string;
      }>,
      string
    >({
      query: (sessionId) => ({
        url: `/ai-assistant/history/${sessionId}`,
      }),
      transformResponse: (response: any) => {
        const rows = response?.data || response || [];
        return Array.isArray(rows) ? rows : [];
      },
    }),
  }),
});

export const { 
  useAnalyzeFileMutation, 
  useAnalyzeTextMutation,
  useGetISOSuggestionsMutation,
  useChatSimpleMutation,
  useGetBenchmarkChatSessionsQuery,
  useLazyGetBenchmarkChatHistoryQuery,
} = benchmarkApi;
