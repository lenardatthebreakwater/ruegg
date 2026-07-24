"use client";

import { useEffect, useRef } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { canTrackStatistics } from "@/lib/analytics/can-track-analytics";

/**
 * Fires a `page_not_found` dataLayer event once per 404 view, carrying the
 * missing URL and the referrer so broken links can be traced to their source
 * (GA4 exploration: event = page_not_found, dimensions = page_path/referrer).
 */
export function NotFoundTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    if (!canTrackStatistics()) return;

    sendGTMEvent({
      event: "page_not_found",
      page_path: window.location.pathname + window.location.search,
      page_referrer: document.referrer || "(direct)",
    });
  }, []);

  return null;
}
