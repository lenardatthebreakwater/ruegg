import { sendGTMEvent } from "@next/third-parties/google";
import { canTrackStatistics } from "@/lib/analytics/can-track-analytics";
import {
  getStapeEventSuffix,
  toStapeEventName,
} from "@/lib/analytics/stape-event-suffix";

/**
 * Consent-gated `dataLayer` push via `sendGTMEvent`, with optional Stape twin
 * (`{event}_stape`) matching ecommerce / generate_lead helpers.
 */
export function pushConsentGatedGtmEvent(
  payload: { event: string } & Record<string, unknown>,
  options?: { stapeTwin?: boolean }
) {
  if (!canTrackStatistics()) return;
  if (typeof window === "undefined") return;

  const { event, ...rest } = payload;
  sendGTMEvent({ event, ...rest });

  if (options?.stapeTwin === false) return;
  const stapeEvent = toStapeEventName(event, getStapeEventSuffix());
  if (stapeEvent) {
    sendGTMEvent({ event: stapeEvent, ...rest });
  }
}
