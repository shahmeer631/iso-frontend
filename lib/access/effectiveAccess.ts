/**
 * Client-side helpers for subscription ∪ User Group effective access.
 * Source of truth remains the backend; these only drive UI (paywalls / CTAs).
 */

type AccessUser = {
  role?: string;
  purchasedPlanIds?: string[];
  planId?: string;
  currentPlan?: string;
  subscribed?: string;
  features?: string[];
  effectivePlans?: string[];
  groupPlans?: string[];
  subscriptionPlans?: string[];
  stripeCustomerId?: string | null;
  hasSubscriptionHistory?: boolean;
} | null | undefined;

const PLAN_RANK: Record<string, number> = {
  PLUS: 1,
  PRO: 2,
  ULTRA: 3,
};

export function userHasFeature(user: AccessUser, feature: string): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "admin") return true;
  const features = (user.features || []).map((f) => f.toUpperCase());
  return features.includes(feature.toUpperCase());
}

/** ULTRA ⊇ PRO ⊇ PLUS */
export function userHasPlanTier(
  user: AccessUser,
  required: "PLUS" | "PRO" | "ULTRA",
): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "admin") return true;
  const owned = (user.effectivePlans || []).map((p) => p.toUpperCase());
  const need = PLAN_RANK[required] || 0;
  return owned.some((p) => (PLAN_RANK[p] || 0) >= need);
}

/** Whether the user already has access to a specific catalog plan (by id). */
export function userOwnsPlanId(
  user: AccessUser,
  planId?: string | null,
): boolean {
  if (!user || !planId) return false;
  if (user.purchasedPlanIds?.includes(planId)) return true;
  if (user.planId === planId) return true;
  return false;
}

export function userHasAnyPaidAccess(user: AccessUser): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "admin") return true;
  if ((user.effectivePlans || []).length > 0) return true;
  if ((user.purchasedPlanIds || []).length > 0) return true;
  if (user.planId && user.currentPlan !== "FREE" && user.subscribed !== "FREE_USER") {
    return true;
  }
  return false;
}

/**
 * True only when the user likely has a live Stripe subscription.
 * UserAccess / group grants alone are not enough — those often exist without
 * an ACTIVE/TRIALING Stripe subscription row, which makes upgrade-subscription fail.
 */
export function userCanUpgradeSubscription(user: AccessUser): boolean {
  if (!user) return false;
  const role = (user.role || "").toUpperCase();
  if (role === "SUPER_ADMIN" || role === "ADMIN") return false;
  // Require Stripe customer + subscription-sourced plans (not group-only access)
  if (!user.stripeCustomerId) return false;
  if ((user.subscriptionPlans || []).length === 0) return false;
  return true;
}

export function extractApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!error || typeof error !== "object") return fallback;
  const err = error as {
    data?: { message?: string; errorSources?: Array<{ details?: string }> };
    error?: string;
    message?: string;
  };
  return (
    err.data?.message ||
    err.data?.errorSources?.[0]?.details ||
    err.message ||
    (typeof err.error === "string" ? err.error : null) ||
    fallback
  );
}
