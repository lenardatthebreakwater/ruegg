import { pushConsentGatedGtmEvent } from "@/lib/analytics/push-consent-gated-gtm-event";

export type SelectContentEventPayload = {
  contentType: string;
  contentId?: string;
  linkUrl?: string;
  linkText?: string;
};

/**
 * GA4 `select_content` for marketing / nav CTAs (hero, offers, campaign, blog).
 */
export function pushSelectContentEvent(payload: SelectContentEventPayload) {
  pushConsentGatedGtmEvent({
    event: "select_content",
    content_type: payload.contentType,
    ...(payload.contentId ? { content_id: payload.contentId } : {}),
    ...(payload.linkUrl ? { link_url: payload.linkUrl } : {}),
    ...(payload.linkText ? { link_text: payload.linkText } : {}),
    page_path:
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "",
  });
}
