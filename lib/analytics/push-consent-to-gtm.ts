import type { CookieConsentValue } from "@/lib/cookie-consent";
import { cookieConsentToConsentMode } from "@/lib/analytics/consent-mode-map";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** GTM custom event name — use a trigger "Custom Event" = this value after consent changes. */
export const GTM_COOKIE_CONSENT_UPDATE_EVENT = "peis_cookie_consent_update";

/** Window event for in-app listeners (e.g. Chatway) when consent is saved or hydrated. */
export const COOKIE_CONSENT_UPDATE_EVENT = "peis_cookie_consent_update";

/**
 * Syncs the current cookie consent to Google Tag Manager / gtag consent mode.
 * Also pushes a `dataLayer` event so tags can use a Custom Event trigger on consent.
 * Safe to call from browser only (no-ops on server).
 */
export function pushConsentToGtm(consent: CookieConsentValue) {
  if (typeof window === "undefined") return;

  const mode = cookieConsentToConsentMode(consent);
  window.dataLayer = window.dataLayer ?? [];

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", mode);
  } else {
    window.dataLayer.push(["consent", "update", mode]);
  }

  window.dataLayer.push({
    event: GTM_COOKIE_CONSENT_UPDATE_EVENT,
    cookie_consent_preferences: consent.preferences,
    cookie_consent_statistics: consent.statistics,
    cookie_consent_marketing: consent.marketing,
  });

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_UPDATE_EVENT, { detail: consent })
  );
}
