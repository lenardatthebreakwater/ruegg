"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * Resets document scroll after client-side navigations. Without this, a large
 * scrollY from a long page (e.g. homepage) is kept; on a shorter destination
 * the browser clamps to the end of the document so the user lands at the bottom.
 *
 * Syncs with the browser scroll position after route changes (allowed escape hatch
 * per project effect-last rules).
 */
export function NavigationScrollToTop() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }
    if (previousPathnameRef.current === pathname) {
      return;
    }
    previousPathnameRef.current = pathname;

    const root = document.scrollingElement ?? document.documentElement;
    root.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
