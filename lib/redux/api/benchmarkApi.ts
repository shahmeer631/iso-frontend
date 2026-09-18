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
        // FormData is automatically handled by RTK Query's fetchBaseQuery
      }),
    }),
    analyzeText: builder.mutation<BenchmarkResponse, BenchmarkTextRequest>({
      query: (data) => ({
        url: '/ai-assistant/benchmark/analyze-text',
        method: 'POST',
        body: data,
      }),
    }),
    getISOSuggestions: builder.mutation<ISOSuggestionsResponse, FormData>({
      query: (formData) => ({
        url: '/ai-assistant/benchmark-ai/iso-suggestions',
        method: 'POST',
        body: formData,
      }),
    }),
    chatSimple: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/chat-simple',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useAnalyzeFileMutation, 
  useAnalyzeTextMutation,
  useGetISOSuggestionsMutation,
  useChatSimpleMutation
} = benchmarkApi;

