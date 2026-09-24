"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProfileQuery } from "@/lib/redux/features/auth/authApi";
import { setCredentials, selectCurrentToken, selectCurrentUser } from "@/lib/redux/features/auth/authSlice";

export const AuthHydrator = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const reduxToken = useSelector(selectCurrentToken);

  // 1. Check for token in cookies on mount
  useEffect(() => {
    if (!reduxToken) {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      const cookieToken = match ? match[2] : null;

      if (cookieToken) {
        // We found a token! We'll let the useGetProfileQuery hook handle the fetch
        // and we'll dispatch the result once it's available.
      }
    }
  }, [reduxToken, dispatch]);

  // 2. Automatically fetch profile if we have a token (via baseApi's prepareHeaders)
  // This query will skip if there's no token in Redux OR Cookies (handled in baseApi)
  const canSkip = typeof document === 'undefined' || (!reduxToken && !document.cookie.includes('token='));
  const { data: profileRes, isSuccess, refetch } = useGetProfileQuery(undefined, {
    skip: canSkip,
  });

  const user = useSelector(selectCurrentUser);

  // Force a fresh profile refetch when token changes (e.g. on login/switch account)
  useEffect(() => {
    if (reduxToken) {
      console.log("AuthHydrator Token Effect - Token changed/active. Refetching profile...");
      refetch();
    }
  }, [reduxToken, refetch]);

  // Polling logic to handle Stripe Webhook latency
  useEffect(() => {
    if (typeof window === "undefined" || !reduxToken) return;

    const justPurchasedPlanId = sessionStorage.getItem("just_purchased");
    console.log("AuthHydrator Polling Effect - justPurchasedPlanId:", justPurchasedPlanId, "user plans:", user?.purchasedPlanIds);
    if (!justPurchasedPlanId) return;

    // If the plan is already in the user's purchasedPlanIds, stop polling
    if (user?.purchasedPlanIds?.includes(justPurchasedPlanId)) {
      console.log("AuthHydrator Polling Effect - Plan is now purchased! Stopping polling.");
      sessionStorage.removeItem("just_purchased");
      return;
    }

    console.log("AuthHydrator Polling Effect - Plan not found in profile yet. Starting polling...");
    const interval = setInterval(() => {
      console.log("AuthHydrator Polling Effect - Refetching profile...");
      refetch();
    }, 2000);

    const timeout = setTimeout(() => {
      console.log("AuthHydrator Polling Effect - Timeout reached. Stopping polling.");
      clearInterval(interval);
      sessionStorage.removeItem("just_purchased");
    }, 20000); // Stop after 20 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, reduxToken, refetch]);

  // 3. Sync profile data to Redux state
  useEffect(() => {
    if (isSuccess && profileRes?.data) {
      const userData = profileRes.data;
      console.log("AuthHydrator Sync Effect - Received profile data from server:", userData);
      const tokenMatch = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      const refreshMatch = document.cookie.match(new RegExp('(^| )refreshToken=([^;]+)'));
      const token = tokenMatch ? tokenMatch[2] : "";
      const refreshToken = refreshMatch ? refreshMatch[2] : null;
      
      const purchasedPlanIds = Array.isArray(userData.purchasedPlanIds)
        ? userData.purchasedPlanIds
        : (userData.planId || userData.activePlanId || userData.plan?.id || userData.plan?._id
            ? [userData.planId || userData.activePlanId || userData.plan?.id || userData.plan?._id]
            : []);
      
      console.log("AuthHydrator Sync Effect - Dispatching purchasedPlanIds:", purchasedPlanIds);

      dispatch(
        setCredentials({
          user: {
            id: userData.id || userData._id,
            email: userData.email,
            name: userData.name || userData.fullName,
            role: userData.role,
            purchasedPlanIds: purchasedPlanIds,
            planId: userData.planId || userData.activePlanId || userData.plan?.id || userData.plan?._id,
            currentPlan: userData.currentPlan,
            subscribed: userData.subscribed,
            stripeCustomerId: userData.stripeCustomerId,
            hasSubscriptionHistory: userData.hasSubscriptionHistory,
            features: userData.features || userData.effectiveAccess?.features || [],
            effectivePlans: userData.effectivePlans || userData.effectiveAccess?.effectivePlans || [],
            groupPlans: userData.groupPlans || userData.effectiveAccess?.groupPlans || [],
            subscriptionPlans: userData.subscriptionPlans || userData.effectiveAccess?.subscriptionPlans || [],
          },
          token: token,
          refreshToken: refreshToken,
        })
      );
    }
  }, [isSuccess, profileRes, dispatch]);

  return (
    <>
      {children}
    </>
  );
};

export default AuthHydrator;
