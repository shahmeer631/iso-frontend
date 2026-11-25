export type LtdTier = "PLUS" | "PRO" | "ULTRA";

export type PromotionState =
  | "SCHEDULED"
  | "ACTIVE"
  | "EXPIRED"
  | "DISABLED";

export type PublicPurchaseOption = {
  tier: LtdTier;
  price: number;
  currency: string;
  annualAnchorPrice: number;
};

export type PricingDisplayMode = "LIFETIME" | "ANNUAL";

export type PublicPromotionStatus = {
  promotionId: string;
  name: string;
  status: PromotionState;
  isPurchasable: boolean;
  /** Backend UTC: LIFETIME while ACTIVE, else ANNUAL ($84/$120/$156) */
  pricingMode: PricingDisplayMode;
  startsAt: string;
  endsAt: string;
  serverTime: string;
  remainingMs: number;
  remaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  msUntilStart: number;
  currency: string;
  prices: {
    plus: number;
    pro: number;
    ultra: number;
  };
  annualAnchors: {
    plus: number;
    pro: number;
    ultra: number;
  };
  /** Restored annual list after expiry */
  standardAnnualPrices: {
    plus: number;
    pro: number;
    ultra: number;
  };
  /** Empty when not purchasable — remove LTD CTAs from server response */
  purchaseOptions: PublicPurchaseOption[];
};

/** Document standard annual prices restored when LTD ends. */
export const STANDARD_ANNUAL_PRICES = {
  PLUS: 84,
  PRO: 120,
  ULTRA: 156,
} as const;

export type LifetimeDealStatusResponse = {
  success: boolean;
  message: string;
  data: PublicPromotionStatus;
};

/** Document-aligned LTD card content (entitlements verified against Plus/Pro/Ultra). */
export type LtdTierContent = {
  tier: LtdTier;
  nameKey: string;
  badgeKey: string;
  descriptionKey: string;
  subtextKey: string;
  ctaKey: string;
  featureKeys: string[];
  highlight?: boolean;
};

export const LTD_TIER_CONTENT: LtdTierContent[] = [
  {
    tier: "PLUS",
    nameKey: "ltd.tierPlusName",
    badgeKey: "ltd.tierPlusBadge",
    descriptionKey: "ltd.tierPlusDescription",
    subtextKey: "ltd.tierPlusSubtext",
    ctaKey: "ltd.tierPlusCta",
    featureKeys: [
      "ltd.plusFeatLibrary",
      "ltd.plusFeatMastery",
      "ltd.plusFeatCompetency",
      "ltd.plusFeatCpd",
    ],
  },
  {
    tier: "PRO",
    nameKey: "ltd.tierProName",
    badgeKey: "ltd.tierProBadge",
    descriptionKey: "ltd.tierProDescription",
    subtextKey: "ltd.tierProSubtext",
    ctaKey: "ltd.tierProCta",
    featureKeys: [
      "ltd.proFeatEverything",
      "ltd.proFeatAcademy",
      "ltd.proFeatVideo",
      "ltd.proFeatStudy",
      "ltd.proFeatCpd",
    ],
    highlight: true,
  },
  {
    tier: "ULTRA",
    nameKey: "ltd.tierUltraName",
    badgeKey: "ltd.tierUltraBadge",
    descriptionKey: "ltd.tierUltraDescription",
    subtextKey: "ltd.tierUltraSubtext",
    ctaKey: "ltd.tierUltraCta",
    featureKeys: [
      "ltd.ultraFeatEverything",
      "ltd.ultraFeatAssistant",
      "ltd.ultraFeatNavigator",
      "ltd.ultraFeatAudit",
      "ltd.ultraFeatBenchmark",
    ],
  },
];
