import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'
import { logOut, setTokens } from '../features/auth/authSlice'
import { toast } from 'sonner'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.isobrain.ai/api/v1',
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Skip adding the token for the refresh-token endpoint
    if (endpoint === 'refreshToken' || headers.has('Skip-Auth')) {
      headers.delete('Skip-Auth');
      return headers;
    }

    let token = (getState() as RootState).auth.token;
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) token = match[2];
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const redirectToLogin = (lang: string = 'en') => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/auth/')) {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = `/${lang}/auth/login`;
    }
  }
};

const getLangFromPath = () => {
  if (typeof window === 'undefined') return 'en';
  const KNOWN_LOCALES = ['en', 'fr', 'mg'];
  const langMatch = window.location.pathname.match(/^\/([^\/]+)/);
  const segment = langMatch ? langMatch[1] : '';
  return KNOWN_LOCALES.includes(segment) ? segment : 'en';
};

const redirectToPricing = (lang: string = 'en', message?: string) => {
  if (typeof window !== 'undefined') {
    const url = message 
      ? `/${lang}/pricing?error=${encodeURIComponent(message)}`
      : `/${lang}/pricing`;
    window.location.href = url;
  }
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Use current state or cookie to ensure we have the most up-to-date token
  let result = await baseQuery(args, api, extraOptions);

  // 1. Handle "Please create an account to continue" error
  const errorData = result.error?.data as any;
  if (errorData?.message === "Please create an account to continue") {
    const url = typeof args === 'string' ? args : args?.url || '';
    const endpoint = api.endpoint;
    const isBypassed =
      url.includes('/quiz/quiz-generate') ||
      url.includes('/mastery-labs/submit') ||
      endpoint === 'generateQuiz' ||
      endpoint === 'submitAssessment';

    if (!isBypassed) {
      api.dispatch(logOut());
      redirectToLogin(getLangFromPath());
    }
    return result;
  }

  // Handle "Free limit reached" error (checking both error and data cases)
  const potentialData = (result.error?.data as any) || (result.data as any);
  const msg = potentialData?.message || (result.error as any)?.message;

  if (msg && typeof msg === 'string' && msg.toLowerCase().includes("free limit reached")) {
    console.error("Subscription Limit Hit:", msg);
    // Don't show toast here if we're redirecting, as the reload will clear it.
    // We pass it to the pricing page instead.
    redirectToPricing(getLangFromPath(), msg);
    return result;
  }

  // 2. Handle 401 Unauthorized (Token Refresh Logic)
  if (result.error && result.error.status === 401) {
    // Check if the failed request was already a refresh attempt
    const url = typeof args === 'string' ? args : args.url;
    const isRefreshRequest = url.includes('refresh-token') || url.includes('refresh_token');

    if (isRefreshRequest) {
      // If the refresh itself fails, we must logout but let's avoid the hard redirect
      api.dispatch(logOut());
      // redirectToLogin is now optional or avoided per user request
      return result;
    }

    const state = api.getState() as RootState;
    let refreshToken = state.auth.refreshToken;

    if (!refreshToken && typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )refreshToken=([^;]+)'));
      if (match) refreshToken = match[2];
    }

    if (refreshToken) {
      // Attempt refresh with multiple potential endpoints if one fails
      const endpointsToTry = ['/auth/refresh-token', '/users/refresh-token'];
      let refreshResult = null;

      for (const endpoint of endpointsToTry) {
        refreshResult = await baseQuery(
          {
            url: endpoint,
            method: 'POST',
            body: { refreshToken },
            headers: { 'Skip-Auth': 'true' }
          },
          api,
          extraOptions
        );

        if (refreshResult.data) break;
      }

      const refreshData = (refreshResult?.data) as any;
      if (refreshData) {
        // Robust token extraction
        const newAccessToken =
          refreshData.accessToken ||
          refreshData.token ||
          refreshData.data?.accessToken ||
          refreshData.data?.token ||
          refreshData.data?.data?.accessToken;

        const newRefreshToken =
          refreshData.refreshToken ||
          refreshData.data?.refreshToken ||
          refreshToken;

        if (newAccessToken) {
          api.dispatch(setTokens({ token: newAccessToken, refreshToken: newRefreshToken }));

          if (typeof document !== 'undefined') {
            document.cookie = `token=${newAccessToken}; path=/; max-age=31536000`;
            document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=31536000`;
          }

          // Retry the original request
          return baseQuery(args, api, extraOptions);
        }
      }
    }

    // Per user request: "login a jawyar dorkar nai" - we just logout but stay on page
    api.dispatch(logOut());
  }
  return result;
};

// Create our base API instance
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  // Define tag types for caching and invalidation
  tagTypes: ['User', 'Auth', 'Courses', 'Bundles', 'Videos', 'Categories', 'Documents', 'Groups', 'ISOStandards', 'Notes', 'Leaderboard', 'ChatSessions'],
  endpoints: () => ({}),
})

