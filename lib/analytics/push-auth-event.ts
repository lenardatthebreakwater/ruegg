import { pushConsentGatedGtmEvent } from "@/lib/analytics/push-consent-gated-gtm-event";

/** GA4 `login` after successful Min konto sign-in. */
export function pushLoginEvent(method = "email") {
  pushConsentGatedGtmEvent({
    event: "login",
    method,
  });
}

/** GA4 `sign_up` after successful Min konto registration. */
export function pushSignUpEvent(method = "email") {
  pushConsentGatedGtmEvent({
    event: "sign_up",
    method,
  });
}
