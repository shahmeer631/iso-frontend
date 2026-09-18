import { baseApi } from '../../api/baseApi';

export interface CreateIntentRequest {
  planId: string;
  userId: string;
  courseId?: string;
  couponCode?: string;
  paymentMethodId?: string;
}

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  planName: string;
}

export interface ValidateCouponResponse {
  couponId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<{ success: boolean; data: ValidateCouponResponse; message: string }, { code: string; planId: string; userId: string }>({
      query: (body) => ({
        url: '/coupons/validate',
        method: 'POST',
        body,
      }),
    }),
    createPaymentIntent: builder.mutation<{ success: boolean; data: PaymentIntentData; message: string }, CreateIntentRequest>({
      query: (body) => ({
        url: '/payments/create-subscription',
        method: 'POST',
        body,
      }),
    }),

    // Upgrade Subscription api call

    upgradeSubscription: builder.mutation<{ success: boolean; data: PaymentIntentData; message: string }, { newPlanId: string }>({
      query: (body) => ({
        url: '/payments/upgrade-subscription',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useCreatePaymentIntentMutation, useUpgradeSubscriptionMutation, useValidateCouponMutation } = paymentApi;