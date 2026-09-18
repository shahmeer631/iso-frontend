import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './features/auth/authSlice';
import isoNavigatorReducer from './features/isoNavigatorSlice';
import auditLensReducer from './features/auditLensSlice';
import benchmarkReducer from './features/benchmarkSlice';
 

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    isoNavigator: isoNavigatorReducer,
    auditLens: auditLensReducer,
    benchmark: benchmarkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
