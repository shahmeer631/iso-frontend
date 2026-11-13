const STORAGE_KEY = "iso_guest_id";
const GUEST_ID_RE = /^guest_[a-zA-Z0-9_-]{8,64}$/;

/** Stable anonymous visitor id for freemium quota (mirrors backend cookie). */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && GUEST_ID_RE.test(existing)) return existing;

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    const id = `guest_${hex}`;
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `guest_${Date.now().toString(36)}`;
  }
}
