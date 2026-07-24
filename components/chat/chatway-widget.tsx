"use client";

import Script from "next/script";
import { useState } from "react";
import {
  readCookieConsentFromDocument,
  type CookieConsentValue,
} from "@/lib/cookie-consent";
import { COOKIE_CONSENT_UPDATE_EVENT } from "@/lib/analytics/push-consent-to-gtm";
import { useMountEffect } from "@/lib/hooks/effect-last";

const chatwayId = process.env.NEXT_PUBLIC_CHATWAY_ID?.trim();

/** Ms after `window` load before injecting Chatway (keeps it out of lab metrics). */
const LOAD_DELAY_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_CHATWAY_DELAY_MS?.trim();
  if (!raw) return 5000;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 5000;
})();

function preferencesAllowed(consent: CookieConsentValue | null): boolean {
  return Boolean(consent?.preferences);
}

/** Best-effort cleanup when preferences consent is revoked mid-session. */
function removeChatwayDom() {
  if (typeof document === "undefined") return;

  document.getElementById("chatway")?.remove();
  document
    .querySelectorAll(
      "iframe[src*='chatway.app'], [class*='chatway'], [id*='chatway']"
    )
    .forEach((node) => node.remove());
}

/**
 * Chatway live chat. Loads only when `NEXT_PUBLIC_CHATWAY_ID` is set, the
 * visitor has granted preferences consent, and a post-load delay has elapsed
 * (default 5s) so PageSpeed / GTmetrix are less affected.
 */
export function ChatwayWidget() {
  const [allowed, setAllowed] = useState(false);
  const [loadDeferred, setLoadDeferred] = useState(false);

  useMountEffect(() => {
    if (!chatwayId) return;

    const sync = (consent?: CookieConsentValue | null) => {
      const next = preferencesAllowed(
        consent ?? readCookieConsentFromDocument()
      );
      setAllowed((prev) => {
        if (prev && !next) {
          removeChatwayDom();
        }
        return next;
      });
    };

    sync();

    const onConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentValue>).detail;
      sync(detail ?? null);
    };

    window.addEventListener(COOKIE_CONSENT_UPDATE_EVENT, onConsentUpdate);

    let delayTimer: number | null = null;
    let idleId: number | null = null;
    let cancelled = false;

    const armDelay = () => {
      delayTimer = window.setTimeout(() => {
        const requestIdle = window.requestIdleCallback;
        if (typeof requestIdle === "function") {
          idleId = requestIdle(
            () => {
              if (!cancelled) setLoadDeferred(true);
            },
            { timeout: 2000 }
          );
          return;
        }
        if (!cancelled) setLoadDeferred(true);
      }, LOAD_DELAY_MS);
    };

    if (document.readyState === "complete") {
      armDelay();
    } else {
      window.addEventListener("load", armDelay, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener(COOKIE_CONSENT_UPDATE_EVENT, onConsentUpdate);
      window.removeEventListener("load", armDelay);
      if (delayTimer != null) window.clearTimeout(delayTimer);
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  });

  if (!chatwayId || !allowed || !loadDeferred) {
    return null;
  }

  return (
    <Script
      id="chatway"
      src={`https://cdn.chatway.app/widget.js?id=${encodeURIComponent(chatwayId)}`}
      strategy="lazyOnload"
    />
  );
}
