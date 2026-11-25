import { baseApi } from "../../api/baseApi";
import type { LifetimeDealStatusResponse, LtdTier } from "@/lib/lifetimeDeal/types";

export type ValidateLtdPurchaseBody = {
  tier: LtdTier;
  amount?: number;
  currency?: string;
  promotionId?: string;
};

export type CreateLtdCheckoutBody = {
  tier: LtdTier;
  amount?: number;
  currency?: string;
  promotionId?: string;
  idempotencyKey?: string;
  lang?: string;
};

export type LtdCheckoutResult = {
  checkoutUrl: string;
  sessionId: string;
  purchaseId: string;
  tier: LtdTier;
  amount: number;
  currency: string;
  mode: "payment";
  reused: boolean;
};

export const lifetimeDealApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLifetimeDealStatus: builder.query<LifetimeDealStatusResponse, void | { promotionId?: string }>({
      query: (arg) => {
        const promotionId =
          arg && typeof arg === "object" ? arg.promotionId : undefined;
        return promotionId
          ? `/lifetime-deal/status/${encodeURIComponent(promotionId)}`
          : "/lifetime-deal/status";
      },
      // Keep countdown deadline fresh without aggressive refetch storms
      keepUnusedDataFor: 60,
    }),
    validateLifetimeDealPurchase: builder.mutation<
      { success: boolean; message: string; data: unknown },
      ValidateLtdPurchaseBody
    >({
      query: (body) => ({
        url: "/lifetime-deal/validate",
        method: "POST",
        body,
      }),
    }),
    createLifetimeDealCheckout: builder.mutation<
      { success: boolean; message: string; data: LtdCheckoutResult },
      CreateLtdCheckoutBody
    >({
      query: (body) => ({
        url: "/lifetime-deal/checkout",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetLifetimeDealStatusQuery,
  useValidateLifetimeDealPurchaseMutation,
  useCreateLifetimeDealCheckoutMutation,
} = lifetimeDealApi;
