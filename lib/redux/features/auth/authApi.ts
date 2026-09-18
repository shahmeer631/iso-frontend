import { baseApi } from '../../api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    googleLogin: builder.mutation<any, { token: string }>({
      query: (data) => ({
        url: '/auth/google',
        method: 'POST',
        body: data,
      }),
    }),
    facebookLogin: builder.mutation<any, { token: string }>({
      query: (data) => ({
        url: '/auth/facebook',
        method: 'POST',
        body: data,
      }),
    }),
    linkedinLogin: builder.mutation<any, { token: string }>({
      query: (data) => ({
        url: '/auth/linkedin',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation<any, { email: string }>({
      query: (data) => ({
        url: '/users/register',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<any, { email: string; otp: string; purpose: string }>({
      query: (data) => ({
        url: '/otp/verify',
        method: 'POST',
        body: data,
      }),
    }),
    completeProfile: builder.mutation<any, { firstName: string; lastName: string; password: string }>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    checkEnrollment: builder.mutation<any, { courseId: string }>({
      query: (data) => ({
        url: '/user-dashboard',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useFacebookLoginMutation,
  useLinkedinLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useCompleteProfileMutation,
  useGetProfileQuery,
  useCheckEnrollmentMutation
} = authApi;
