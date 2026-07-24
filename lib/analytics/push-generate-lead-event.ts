import { pushConsentGatedGtmEvent } from "@/lib/analytics/push-consent-gated-gtm-event";

export type GenerateLeadEventPayload = {
  formId: string;
  formName: string;
  productName?: string;
};

/**
 * Pushes GA4 `generate_lead` to `dataLayer` after a successful contact form submit,
 * then optionally `generate_lead_stape` for Stape Custom Event triggers.
 *
 * Includes form_id / form_name plus page context so one ContactForm component can be
 * segmented by placement in GTM. No-ops without statistics consent.
 */
export function pushGenerateLeadEvent(payload: GenerateLeadEventPayload) {
  pushConsentGatedGtmEvent({
    event: "generate_lead",
    form_id: payload.formId,
    form_name: payload.formName,
    page_path:
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "",
    page_location: typeof window !== "undefined" ? window.location.href : "",
    page_title: typeof document !== "undefined" ? document.title : "",
    ...(payload.productName ? { product_name: payload.productName } : {}),
  });
}
