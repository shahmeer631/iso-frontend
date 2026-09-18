import { baseApi } from './baseApi';

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
  slug: string;
  instructor: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  cpdHours: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: CourseCategory;
  _count: {
    lessons: number;
  };
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], CourseQueryParams | void>({
      query: (params) => ({
        url: '/courses',
        method: 'GET',
        params: {
          page: params?.page,
          limit: params?.limit || 100, // Default to 100 to show "all"
        },
      }),
      transformResponse: (response: any) => {
        // Handle cases where response might be wrapped in { data: [...] }
        return response?.data || response;
      },
      providesTags: ['Courses'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
} = courseApi;
