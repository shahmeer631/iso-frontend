import { baseApi } from '../api/baseApi';
import { AuditLensFormData, AuditLensResponse, AuditChatHistoryItem } from '@/types/audit-lens';

export const auditLensApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    generateAuditMaterials: builder.mutation<AuditLensResponse, AuditLensFormData>({
      query: (body) => ({
        url: '/ai-assistant/audit',
        method: 'POST',
        body,
      }),
    }),
    chatWithAuditAi: builder.mutation<{ content: string }, { message: string; history: AuditChatHistoryItem[]; sessionId?: string }>({
      query: (body) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body,
      }),
    }),
    chatSimple: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/chat-simple',
        method: 'POST',
        body: data,
      }),
    }),
    generateAuditContext: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/audit/context',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.success !== undefined) return response;
        if (response?.options) return { success: true, data: response };
        if (response?.data?.options) return { success: true, data: response.data, message: response.message };
        return { success: true, data: response };
      },
    }),
    generateAuditStep: builder.mutation<any, any>({
      query: (data) => ({
        url: '/ai-assistant/audit/step',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.success !== undefined && response?.data) return response;
        if (response?.guidance || response?.step_number) {
          return { success: true, data: response };
        }
        return {
          success: response?.success !== false,
          message: response?.message || '',
          data: response?.data || response,
        };
      },
    }),
  }),
});

export const { 
  useGenerateAuditMaterialsMutation,
  useChatWithAuditAiMutation,
  useChatSimpleMutation,
  useGenerateAuditContextMutation,
  useGenerateAuditStepMutation
} = auditLensApi;

