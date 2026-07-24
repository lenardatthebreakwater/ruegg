"use client";

import { readCookieConsentFromDocument } from "@/lib/cookie-consent";
import { pushConsentToGtm } from "@/lib/analytics/push-consent-to-gtm";
import { useMountEffect } from "@/lib/hooks/effect-last";

/**
 * Re-applies consent from the peis cookie after load so returning visitors
 * are not stuck on default-denied after hydration.
 */
export function ConsentModeHydration() {
  useMountEffect(() => {
    const stored = readCookieConsentFromDocument();
    if (stored) {
      pushConsentToGtm(stored);
    }
  });

  return null;
}
