import { sendGTMEvent } from "@next/third-parties/google";
import { canTrackStatistics } from "@/lib/analytics/can-track-analytics";
import {
  getStapeEventSuffix,
  toStapeEventName,
} from "@/lib/analytics/stape-event-suffix";

type Ga4EcommercePayload = Record<string, unknown>;

/**
 * Pushes a GA4-style ecommerce event to `dataLayer` (clears previous `ecommerce` first),
 * then optionally a second `event` with the Stape suffix (same `ecommerce` object) for
 * Stape GTM per-event tags.
 *
 * If a legacy GTM "catch-all" GA4 tag and Stape GA4 tags are both active, the same
 * user action can send two GA4 hits. Pause the duplicate in GTM.
 *
 * No-ops on server or without statistics consent.
 */
export function pushGa4EcommerceEvent(payload: {
  event: string;
  ecommerce: Ga4EcommercePayload;
}) {
  if (!canTrackStatistics()) return;
  if (typeof window === "undefined") return;

  const { event, ecommerce } = payload;
  const suffix = getStapeEventSuffix();
  const stapeEvent = toStapeEventName(event, suffix);

  sendGTMEvent({ ecommerce: null });
  sendGTMEvent({
    event,
    ecommerce,
  });
  if (stapeEvent) {
    sendGTMEvent({
      event: stapeEvent,
      ecommerce,
    });
  }
}
