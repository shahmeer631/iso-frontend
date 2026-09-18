import { baseApi } from '../../api/baseApi';

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer?: string;
  correctAnswer?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface LessonVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string | null;
  duration: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  order: number;
  courseId: string;
  videoId: string;
  createdAt: string;
  chapterId: string | null;
  video: LessonVideo;
  quizzes?: Quiz[];
  pdfUrl?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  cpdHours: number;
  thumbnail: string | null;
  isPublished: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  isoStandardId: string;
  lessons: Lesson[];
  category?: {
    id: string;
    name: string;
    description: string;
  };
  isoStandard?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string | null;
  duration: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category: any | null;
  lessons: Lesson[];
}

export interface VideosResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Video[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface NoteRequest {
  courseId: string;
  content: string;
}

export interface NoteData {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  createdAt: string;
}

export interface NoteResponse {
  success: boolean;
  message: string;
  data: NoteData;
}

export const academyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademyVideos: builder.query<VideosResponse, { courseId?: string } | void>({
      query: (params) => ({
        url: '/videos',
        params: params || {},
      }),
      providesTags: ['Videos'],
    }),
    getCourseById: builder.query<CourseResponse, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
      }),
      providesTags: ['Courses'],
    }),
    academyChatBot: builder.mutation<any, any>({
      query: (body) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body,
      }),
    }),
    createNote: builder.mutation<NoteResponse, NoteRequest>({
      query: (body) => ({
        url: '/notes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notes'],
    }),
  }),
  overrideExisting: true,
});

export const { 
  useGetAcademyVideosQuery, 
  useGetCourseByIdQuery, 
  useAcademyChatBotMutation, 
  useCreateNoteMutation 
} = academyApi;
