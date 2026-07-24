import { readCookieConsentFromDocument } from "@/lib/cookie-consent";

/**
 * Returns true when the visitor has opted in to statistics cookies.
 * When no consent cookie exists, returns false (no ecommerce dataLayer noise).
 */
export function canTrackStatistics(): boolean {
  if (typeof window === "undefined") return false;
  const consent = readCookieConsentFromDocument();
  if (!consent) return false;
  return consent.statistics === true;
}
