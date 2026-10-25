/**
 * Student dashboard base URL (separate Next app).
 * - Local: set NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3010
 * - Production builds: omit or set to https://dashboard.isobrain.ai
 */
export const DASHBOARD_BASE_URL = (
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://dashboard.isobrain.ai"
).replace(/\/$/, "");

export function dashboardUrl(path = ""): string {
  if (!path) return DASHBOARD_BASE_URL;
  return `${DASHBOARD_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
