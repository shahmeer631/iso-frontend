import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  purchasedPlanIds: string[];
  planId?: string;
  currentPlan?: string;
  subscribed?: string;
  stripeCustomerId?: string | null;
  hasSubscriptionHistory?: boolean;
  /** Feature flags from subscription ∪ user groups */
  features?: string[];
  /** PLUS | PRO | ULTRA from subscription ∪ groups */
  effectivePlans?: string[];
  groupPlans?: string[];
  subscriptionPlans?: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const initialState: AuthState = {
  token: getCookie('token'),
  refreshToken: getCookie('refreshToken'),
  user: null, // User info still needs to be fetched or stored differently
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token, refreshToken } }: PayloadAction<{ user: User | null; token: string | null; refreshToken: string | null }>
    ) => {
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
    },
    setTokens: (
      state,
      { payload: { token, refreshToken } }: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = token;
      state.refreshToken = refreshToken;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, setTokens, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
