export const COOKIE_CONSENT_NAME = "peis_cookie_consent";

type LegacyCookieConsentValue = "allowed" | "declined";

export type CookieConsentValue = {
  necessary: true;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const DEFAULT_COOKIE_CONSENT: CookieConsentValue = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
};

export const ALLOW_ALL_COOKIE_CONSENT: CookieConsentValue = {
  necessary: true,
  preferences: true,
  statistics: true,
  marketing: true,
};

function parseLegacyCookieConsent(value: LegacyCookieConsentValue): CookieConsentValue {
  return value === "allowed" ? ALLOW_ALL_COOKIE_CONSENT : DEFAULT_COOKIE_CONSENT;
}

function isConsentRecord(value: unknown): value is Partial<CookieConsentValue> {
  return !!value && typeof value === "object";
}

export function normalizeCookieConsent(value: unknown): CookieConsentValue {
  if (value === "allowed" || value === "declined") {
    return parseLegacyCookieConsent(value);
  }

  if (!isConsentRecord(value)) {
    return DEFAULT_COOKIE_CONSENT;
  }

  return {
    necessary: true,
    preferences: Boolean(value.preferences),
    statistics: Boolean(value.statistics),
    marketing: Boolean(value.marketing),
  };
}

export function parseCookieConsentCookieValue(rawValue: string): CookieConsentValue {
  const decoded = decodeURIComponent(rawValue);
  if (decoded === "allowed" || decoded === "declined") {
    return parseLegacyCookieConsent(decoded);
  }

  try {
    return normalizeCookieConsent(JSON.parse(decoded));
  } catch {
    return DEFAULT_COOKIE_CONSENT;
  }
}

/** Reads encoded consent from `document.cookie`, or null if missing (browser only). */
export function readCookieConsentFromDocument(): CookieConsentValue | null {
  if (typeof document === "undefined") return null;

  const prefix = `${COOKIE_CONSENT_NAME}=`;
  const part = document.cookie.split(";").find((c) => c.trim().startsWith(prefix));
  if (!part) return null;

  const raw = part.trim().slice(prefix.length);
  if (!raw) return null;

  try {
    return parseCookieConsentCookieValue(raw);
  } catch {
    return null;
  }
}

/** Builds a Set-Cookie style attribute string for `document.cookie`. */
export function consentCookieString(value: CookieConsentValue): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  const encodedValue = encodeURIComponent(JSON.stringify(normalizeCookieConsent(value)));
  return `${COOKIE_CONSENT_NAME}=${encodedValue}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}
