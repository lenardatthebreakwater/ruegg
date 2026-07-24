"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sends a `page_view` to the data layer on client-side navigations only.
 * Initial load is covered by the GA4 / GTM configuration tag — do not duplicate
 * by also adding a GTM "History Change" trigger for the same event.
 */
export function GtmRouteChange() {
  const pathname = usePathname();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    sendGTMEvent({
      event: "page_view",
      page_path: pathname,
      page_location: typeof window !== "undefined" ? window.location.href : "",
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname]);

  return null;
}
