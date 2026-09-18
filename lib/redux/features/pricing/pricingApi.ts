import { baseApi } from '../../api/baseApi';

export interface SubFeature {
  name?: string;
  description: string;
}

export interface FeatureDescription {
  title: string;
  description?: string;
  subFeatures?: SubFeature[];
}

export interface Plan {
  id: string;
  _id?: string;
  name: string;
  description: string;
  badge: string | null;
  buttonText: string;
  originalPrice: number;
  discountedPrice: number;
  validFrom: string | null;
  validUntil: string | null;
  learningUnits?: number;
  validityDays: number;
  features: string[];
  featuresDescription?: FeatureDescription[];
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<{ success: boolean; data: Plan[]; message: string }, void>({
      query: () => '/plans',
    }),
  }),
  overrideExisting: true,
});

export const { useGetPlansQuery } = pricingApi;
