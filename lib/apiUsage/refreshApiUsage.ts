import { store } from "@/lib/redux/store";
import { baseApi } from "@/lib/redux/api/baseApi";

/** Refresh the global Daily Free Usage banner from the backend. */
export function refreshApiUsageFromBackend() {
  store.dispatch(baseApi.util.invalidateTags(["ApiUsage"]));
}
