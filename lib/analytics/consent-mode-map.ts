import type { CookieConsentValue } from "@/lib/cookie-consent";

/**
 * Maps storefront cookie categories to Google Consent Mode v2 storage types.
 * See: https://developers.google.com/tag-platform/security/guides/consent
 */
export type ConsentModeState = Record<
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "analytics_storage"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage",
  "granted" | "denied"
>;

export const CONSENT_MODE_DEFAULTS: ConsentModeState = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "granted",
  personalization_storage: "denied",
  security_storage: "granted",
};

export function cookieConsentToConsentMode(consent: CookieConsentValue): ConsentModeState {
  return {
    analytics_storage: consent.statistics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    functionality_storage: consent.preferences ? "granted" : "denied",
    personalization_storage: consent.preferences ? "granted" : "denied",
    security_storage: "granted",
  };
}
