import { pushConsentGatedGtmEvent } from "@/lib/analytics/push-consent-gated-gtm-event";

export type ContactClickMethod = "phone" | "email";

export type ContactClickEventPayload = {
  method: ContactClickMethod;
  /** Placement / surface id for GTM segmentation. */
  placement: string;
  linkUrl?: string;
  linkText?: string;
};

/**
 * Lead-intent click on `tel:` / `mailto:` — fires `generate_lead` with `method`
 * so phone/email can be distinguished from form submits (`form_id` still set).
 */
export function pushContactClickEvent(payload: ContactClickEventPayload) {
  const formId =
    payload.method === "phone" ? "click-to-call" : "click-to-email";
  const formName =
    payload.method === "phone" ? "Klikk for å ringe" : "Klikk for e-post";

  pushConsentGatedGtmEvent({
    event: "generate_lead",
    method: payload.method,
    form_id: formId,
    form_name: formName,
    content_type: payload.placement,
    ...(payload.linkUrl ? { link_url: payload.linkUrl } : {}),
    ...(payload.linkText ? { link_text: payload.linkText } : {}),
    page_path:
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "",
    page_location: typeof window !== "undefined" ? window.location.href : "",
    page_title: typeof document !== "undefined" ? document.title : "",
  });
}

export function contactMethodFromHref(href: string): ContactClickMethod | null {
  const value = href.trim().toLowerCase();
  if (value.startsWith("tel:")) return "phone";
  if (value.startsWith("mailto:")) return "email";
  return null;
}
