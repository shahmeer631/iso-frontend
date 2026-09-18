// import { baseApi } from './baseApi';
// import { 
//   ISONavigatorFormData, 
//   GenerateDocumentResponse, 
//   ChatRequest, 
//   ChatResponse,
//   ContextGeneratorResponse,
//   ContextSuggestion,
//   ISOSuggestionsResponse,
//   ISOSuggestion,
// } from '@/types/iso-navigator';

// export interface ContextGeneratorRequest {
//   text?: string;
//   url?: string;
// }

// export interface ISOSuggestionsRequest {
//   category: string;
// }

// export const isoNavigatorApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     generateDocument: builder.mutation<GenerateDocumentResponse, ISONavigatorFormData>({
//       query: (data) => ({
//         url: '/ai-assistant/navigator/generate',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['ISOStandards'],
//     }),
//     chatWithAi: builder.mutation<ChatResponse, ChatRequest>({
//       query: (data) => ({
//         url: '/ai-assistant/chat',
//         method: 'POST',
//         body: data,
//       }),
//     }),
//     chatSimple: builder.mutation<any, any>({
//       query: (data) => ({
//         url: '/ai-assistant/chat-simple',
//         method: 'POST',
//         body: data,
//       }),
//     }),
//     generateContextSuggestions: builder.mutation<any[], ContextGeneratorRequest>({
//       query: (data) => ({
//         url: '/ai-assistant/context-generator',
//         method: 'POST',
//         body: data,
//       }),
//       transformResponse: (response: ContextGeneratorResponse) => {
//         // Transform API response to keep the full object with what, where, why, when, whom
//         return response.data?.options?.map((option, index) => ({
//           id: index + 1,
//           ...option,
//         })) || [];
//       },
//     }),
//     getISOSuggestions: builder.mutation<ISOSuggestion[], ISOSuggestionsRequest>({
//       query: (data) => ({
//         url: '/ai-assistant/iso-suggestions',
//         method: 'POST',
//         body: data,
//       }),
//       transformResponse: (response: ISOSuggestionsResponse) => {
//         return response.data?.suggestions || [];
//       },
//     }),
//   }),
// });

// export const { 
//   useGenerateDocumentMutation, 
//   useChatWithAiMutation,
//   useChatSimpleMutation,
//   useGenerateContextSuggestionsMutation,
//   useGetISOSuggestionsMutation,
// } = isoNavigatorApi;

import { baseApi } from './baseApi';
import {
  ISONavigatorFormData,
  GenerateDocumentResponse,
  ChatRequest,
  ChatResponse,
  ContextGeneratorResponse,
  ContextSuggestion,
  ISOSuggestionsResponse,
  ISOSuggestion,
} from '@/types/iso-navigator';

export interface ContextGeneratorRequest {
  text?: string;
  url?: string;
}

export interface ISOSuggestionsRequest {
  category: string;
}

export const isoNavigatorApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateDocument: builder.mutation<GenerateDocumentResponse, ISONavigatorFormData>({
      query: (data) => ({
        url: '/ai-assistant/navigator/generate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any): GenerateDocumentResponse => {
        // Unwrap nested { success, data } / { data: { data } } envelopes
        let payload = response;
        if (payload?.data && (payload.success !== undefined || payload.message !== undefined)) {
          // Standard backend sendResponse shape
          let data = payload.data;
          // AI may nest another envelope inside data
          if (data?.data && (data.content || data.data?.content || data.title || data.data?.title)) {
            if (!data.content && data.data) data = data.data;
          }
          return {
            success: payload.success !== false,
            message: payload.message || '',
            data,
          };
        }
        if (payload?.content || payload?.title) {
          return { success: true, message: '', data: payload };
        }
        return {
          success: true,
          message: '',
          data: payload?.data || payload,
        };
      },
      invalidatesTags: ['ISOStandards'],
    }),
    chatWithAi: builder.mutation<ChatResponse, ChatRequest>({
      query: (data) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body: data,
      }),
    }),
    chatSimple: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/chat-simple',
        method: 'POST',
        body: data,
      }),
    }),
    generateContextSuggestions: builder.mutation<any[], ContextGeneratorRequest>({
      query: (data) => ({
        url: '/ai-assistant/context-generator',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ContextGeneratorResponse) => {
        // Transform API response to keep the full object with what, where, why, when, whom
        return response.data?.options?.map((option, index) => ({
          id: index + 1,
          ...option,
        })) || [];
      },
    }),
    getISOSuggestions: builder.mutation<ISOSuggestion[], ISOSuggestionsRequest>({
      query: (data) => ({
        url: '/ai-assistant/iso-suggestions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        return response?.data?.suggestions || response?.suggestions || response?.data || [];
      },
    }),
  }),
});

export const {
  useGenerateDocumentMutation,
  useChatWithAiMutation,
  useChatSimpleMutation,
  useGenerateContextSuggestionsMutation,
  useGetISOSuggestionsMutation,
} = isoNavigatorApi;
