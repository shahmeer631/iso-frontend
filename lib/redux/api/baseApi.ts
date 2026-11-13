import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'
import { logOut, setTokens } from '../features/auth/authSlice'
import { toast } from 'sonner'
import { getOrCreateGuestId } from '@/lib/apiUsage/guestId'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.isobrain.ai/api/v1',
  // Needed so httpOnly guestId / auth cookies travel with freemium quota checks
  credentials: 'include',
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
    } else if (typeof window !== 'undefined') {
      // Anonymous freemium identity (validated server-side)
      headers.set('X-Guest-Id', getOrCreateGuestId())
    }

    // Propagate UI locale for DB content + AI localization
    if (typeof window !== 'undefined') {
      const lang = getLangFromPath();
      headers.set('X-Locale', lang);
      headers.set('Accept-Language', lang);
    }
    return headers
  },
})

const redirectToLogin = (lang: string = 'en', preserveReturn = false) => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/auth/')) {
      if (!preserveReturn) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      const from = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      );
      window.location.href = preserveReturn
        ? `/${lang}/auth/login?from=${from}`
        : `/${lang}/auth/login`;
    }
  }
};

const getLangFromPath = () => {
  if (typeof window === 'undefined') return 'en';
  const KNOWN_LOCALES = ['en', 'es', 'ar', 'fr', 'it', 'hi'];
  const langMatch = window.location.pathname.match(/^\/([^\/]+)/);
  const segment = langMatch ? langMatch[1] : '';
  return KNOWN_LOCALES.includes(segment) ? segment : 'en';
};

const redirectToPricing = (lang: string = 'en', message?: string) => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams();
    if (message) params.set('error', message);
    const from = `${window.location.pathname}${window.location.search}`;
    if (from && !from.includes('/auth/') && !from.includes('/pricing')) {
      params.set('from', from);
    }
    const qs = params.toString();
    window.location.href = qs ? `/${lang}/pricing?${qs}` : `/${lang}/pricing`;
  }
};

/** Paths that consume freemium quota (exclude reads + internal warm/cache helpers). */
const isMeteredApiCall = (url: string, method: string) => {
  const m = method.toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return false;
  if (url.includes('/api-usage')) return false;
  if (url.includes('/library/warm-pdf')) return false;
  if (url.includes('/ai-assistant/history')) return false;
  if (url.includes('/ai-assistant/sessions')) return false;
  return (
    url.includes('/ai-assistant/') ||
    url.includes('/quiz/quiz-generate')
  );
};

const getRequestMethod = (args: string | FetchArgs) => {
  if (typeof args === 'string') return 'GET';
  return (args.method || 'GET').toUpperCase();
};

type UsageDraft = {
  data?: {
    used: number;
    limit: number;
    remaining: number;
    resetsAt: string | null;
    windowStartAt?: string | null;
    unlimited: boolean;
  };
};

/** Lazy refs — set after createApi so baseQuery can sync usage without TDZ issues. */
let applyUsageHeaders:
  | ((
      dispatch: (action: unknown) => unknown,
      headers: {
        used: string;
        limit?: string | null;
        remaining?: string | null;
        resetsAt?: string | null;
      },
    ) => void)
  | null = null;
let invalidateApiUsageCache:
  | ((dispatch: (action: unknown) => unknown) => void)
  | null = null;

const syncApiUsageAfterMeteredCall = (
  api: { dispatch: (action: unknown) => unknown },
  result: { meta?: { response?: Response }; data?: unknown; error?: unknown },
) => {
  const response = result.meta?.response;
  const usedHeader = response?.headers?.get?.('X-Api-Usage-Used');
  const limitHeader = response?.headers?.get?.('X-Api-Usage-Limit');
  const remainingHeader = response?.headers?.get?.('X-Api-Usage-Remaining');
  const resetsHeader = response?.headers?.get?.('X-Api-Usage-Resets-At');

  // Prefer immediate banner update from backend-confirmed response headers
  if (usedHeader != null) {
    applyUsageHeaders?.(api.dispatch, {
      used: usedHeader,
      limit: limitHeader,
      remaining: remainingHeader,
      resetsAt: resetsHeader,
    });
  }

  // Always refetch so the banner matches persisted backend state
  invalidateApiUsageCache?.(api.dispatch);
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args?.url || '';
  const method = getRequestMethod(args);

  // Use current state or cookie to ensure we have the most up-to-date token
  let result = await baseQuery(args, api, extraOptions);

  // After a successful metered AI call, sync the global usage banner from backend
  if (!result.error && isMeteredApiCall(url, method)) {
    syncApiUsageAfterMeteredCall(api, result);
  }

  // 1. Handle "Please create an account to continue" error
  const errorData = result.error?.data as any;
  if (errorData?.message === "Please create an account to continue") {
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

  const potentialData = (result.error?.data as any) || (result.data as any);
  const msg = potentialData?.message || (result.error as any)?.message;
  const code = potentialData?.code;

  // Freemium Feature 4 — AI Assistant 5 free steps exhausted
  const isAssistantStepGate =
    code === 'ASSISTANT_STEPS_AUTH_REQUIRED' ||
    code === 'ASSISTANT_STEPS_UPGRADE_REQUIRED' ||
    potentialData?.requiresAuth === true ||
    potentialData?.requiresUpgrade === true;

  if (result.error && isAssistantStepGate) {
    invalidateApiUsageCache?.(api.dispatch);
    toast.error(msg || 'Free AI Assistant steps used', { duration: 6000 });
    const lang = getLangFromPath();
    if (
      code === 'ASSISTANT_STEPS_AUTH_REQUIRED' ||
      potentialData?.requiresAuth
    ) {
      redirectToLogin(lang, true);
    } else {
      redirectToPricing(lang, msg);
    }
    return result;
  }

  // Feature 5 — general website 5 free API calls / 24h exhausted
  const isDailyLimit =
    result.error?.status === 429 ||
    code === 'DAILY_API_LIMIT_REACHED' ||
    code === 'DAILY_API_AUTH_REQUIRED' ||
    code === 'DAILY_API_UPGRADE_REQUIRED' ||
    (typeof msg === 'string' && msg.toLowerCase().includes('free limit reached')) ||
    (typeof msg === 'string' && msg.toLowerCase().includes('5 free api calls'));

  if (isDailyLimit) {
    const usage = potentialData?.usage;
    if (usage && typeof usage.used === 'number') {
      applyUsageHeaders?.(api.dispatch, {
        used: String(usage.used),
        limit: String(usage.limit ?? 5),
        remaining: String(usage.remaining ?? 0),
        resetsAt: usage.resetsAt ?? null,
      });
    }
    invalidateApiUsageCache?.(api.dispatch);
    const resetsAt = usage?.resetsAt || potentialData?.usage?.resetsAt;
    const resetLabel = resetsAt
      ? new Date(resetsAt).toLocaleString()
      : 'your next 24-hour cycle';
    toast.error(msg || 'Daily free API limit reached', {
      description: `Renews ${resetLabel}.`,
      duration: 6000,
    });

    const lang = getLangFromPath();
    const needsAuth =
      code === 'DAILY_API_AUTH_REQUIRED' ||
      potentialData?.requiresAuth === true;
    const needsUpgrade =
      code === 'DAILY_API_UPGRADE_REQUIRED' ||
      potentialData?.requiresUpgrade === true;
    const state = api.getState() as RootState;
    const isSignedIn = Boolean(state.auth?.token || state.auth?.user);

    if (needsAuth || (!isSignedIn && !needsUpgrade)) {
      redirectToLogin(lang, true);
    } else {
      redirectToPricing(lang, msg);
    }
    return result;
  }

  // 2. Handle 401 Unauthorized (Token Refresh Logic)
  if (result.error && result.error.status === 401) {
    // Check if the failed request was already a refresh attempt
    const retryUrl = typeof args === 'string' ? args : args.url;
    const isRefreshRequest = retryUrl.includes('refresh-token') || retryUrl.includes('refresh_token');

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
          const retryResult = await baseQuery(args, api, extraOptions);
          if (!retryResult.error && isMeteredApiCall(url, method)) {
            syncApiUsageAfterMeteredCall(api, retryResult);
          }
          return retryResult;
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
  tagTypes: ['User', 'Auth', 'Courses', 'Bundles', 'Videos', 'Categories', 'Documents', 'Groups', 'ISOStandards', 'Notes', 'Leaderboard', 'ChatSessions', 'ApiUsage'],
  endpoints: () => ({}),
})

applyUsageHeaders = (dispatch, headers) => {
  dispatch(
    baseApi.util.updateQueryData('getApiUsage', undefined, (draft: UsageDraft) => {
      if (!draft?.data) return;
      const used = Number(headers.used);
      const limit =
        headers.limit != null ? Number(headers.limit) : draft.data.limit;
      const remaining =
        headers.remaining != null
          ? Number(headers.remaining)
          : Math.max(0, limit - used);
      draft.data.used = Number.isFinite(used) ? used : draft.data.used;
      draft.data.limit = Number.isFinite(limit) ? limit : draft.data.limit;
      draft.data.remaining = Number.isFinite(remaining)
        ? remaining
        : draft.data.remaining;
      if (headers.resetsAt) draft.data.resetsAt = headers.resetsAt;
      draft.data.unlimited = false;
    }) as unknown,
  );
};

invalidateApiUsageCache = (dispatch) => {
  dispatch(baseApi.util.invalidateTags(['ApiUsage']));
};
