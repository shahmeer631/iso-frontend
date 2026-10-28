import { baseApi } from './baseApi';

export interface GenerateQuizRequest {
  context: {
    industry: string;
    management_level: string;
    department: string;
  };
  num_questions: number;
  difficulty: string;
  guestId?: string;
}


export interface GenerateQuizResponse {
  data: GenerateQuizResponse;
  quiz_title: string;
  iso_standard: string | null;
  total_questions: number;
  difficulty: string;
  /** Server-issued exam session for trusted scoring (Phase 3.1) */
  examSessionId?: string;
  questions: Array<{
    id?: string;
    question: string;
    options: Record<string, string>;
    correct_answer: string;
    explanation: string;
  }>;
  generated_at: string;
}

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateQuiz: builder.mutation<GenerateQuizResponse, GenerateQuizRequest>({
      query: (body) => ({
        url: '/quiz/quiz-generate',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useGenerateQuizMutation } = quizApi;
