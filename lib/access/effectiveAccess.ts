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
