"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TURNSTILE_EXPIRED_HINT,
  TURNSTILE_LOAD_FAILED_MESSAGE,
  TURNSTILE_TIMEOUT_HINT,
  TURNSTILE_TRANSIENT_ERROR_HINT,
  getTurnstileSiteKey,
} from "@/lib/security/verify-turnstile";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Flexible widget min width per Cloudflare docs; below this use compact. */
const FLEXIBLE_MIN_WIDTH = 300;

/** Poll for `window.turnstile` when Script `onLoad` is slow or missed. */
const SCRIPT_READY_POLL_MS = 100;
const SCRIPT_READY_TIMEOUT_MS = 15_000;

type TurnstileSize = "flexible" | "compact";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "flexible" | "compact";
      appearance?: "always" | "execute" | "interaction-only";
      retry?: "auto" | "never";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: (errorCode?: string) => void;
      "timeout-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
  getToken: () => string | null;
};

type TurnstileWidgetProps = {
  className?: string;
  onTokenChange?: (token: string | null) => void;
};

function resolveWidgetSize(width: number): TurnstileSize {
  // Always pick a size — never silent no-op on narrow hosts (phones < 300px).
  return width >= FLEXIBLE_MIN_WIDTH ? "flexible" : "compact";
}

/**
 * Pin the Turnstile render target to an integer CSS pixel width.
 * Flexible widgets clip their right edge when the host width is fractional
 * (common in 2-column homepage grids). The outer slot stays `w-full` so
 * ResizeObserver can still see real layout changes.
 */
function applyIntegerHostWidth(slot: HTMLElement, container: HTMLElement) {
  container.style.width = "";
  container.style.maxWidth = "";
  // clientWidth is always an integer content-box width.
  const width = slot.clientWidth;
  if (width > 0) {
    const px = `${width}px`;
    container.style.width = px;
    container.style.maxWidth = px;
  }
  return width;
}

function safeReset(widgetId: string | null) {
  if (!widgetId || !window.turnstile) return;
  try {
    window.turnstile.reset(widgetId);
  } catch {
    // Widget may already be torn down.
  }
}

/**
 * Managed Turnstile widget in a reserved slot so forms do not shift when the
 * challenge iframe mounts. Uses `flexible` when width ≥ 300px, otherwise
 * `compact` (official mobile / narrow layout size).
 *
 * useEffect is intentional: syncs with Cloudflare's imperative Turnstile API.
 * Do NOT call `turnstile.ready()` with next/script async/defer — CF forbids it.
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ className, onTokenChange }, ref) {
  const siteKey = getTurnstileSiteKey();
  const slotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedWidthRef = useRef(0);
  const renderedSizeRef = useRef<TurnstileSize | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile)
  );
  const [scriptFailed, setScriptFailed] = useState(false);
  const [challengeHint, setChallengeHint] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [activeSize, setActiveSize] = useState<TurnstileSize>("flexible");
  const [token, setToken] = useState<string | null>(null);

  onTokenChangeRef.current = onTokenChange;

  useImperativeHandle(ref, () => ({
    reset: () => {
      setChallengeHint(null);
      setToken(null);
      onTokenChangeRef.current?.(null);
      safeReset(widgetIdRef.current);
    },
    getToken: () => {
      if (token) return token;
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current) ?? null;
      }
      return null;
    },
  }));

  // Script may already be present (SPA remount / cached) without firing onLoad.
  useEffect(() => {
    if (scriptReady || typeof window === "undefined") return;
    if (window.turnstile) {
      setScriptReady(true);
      setScriptFailed(false);
      return;
    }

    const pollId = window.setInterval(() => {
      if (window.turnstile) {
        setScriptReady(true);
        setScriptFailed(false);
        window.clearInterval(pollId);
      }
    }, SCRIPT_READY_POLL_MS);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(pollId);
      if (!window.turnstile) {
        setScriptReady(false);
        setScriptFailed(true);
      }
    }, SCRIPT_READY_TIMEOUT_MS);

    return () => {
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
    };
  }, [scriptReady, retryKey]);

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !slotRef.current ||
      !containerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    let cancelled = false;
    const slot = slotRef.current;
    const container = containerRef.current;

    const clearToken = () => {
      setToken(null);
      onTokenChangeRef.current?.(null);
    };

    const mount = () => {
      if (cancelled || !window.turnstile) return;

      const measured = slot.clientWidth;
      // Wait for layout (ResizeObserver retries). Not a permanent narrow-width skip.
      if (measured <= 0) return;

      const size = resolveWidgetSize(measured);

      if (size === "flexible") {
        applyIntegerHostWidth(slot, container);
      } else {
        container.style.width = "";
        container.style.maxWidth = "";
      }

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Already gone.
        }
        widgetIdRef.current = null;
        container.replaceChildren();
      }

      try {
        const widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          theme: "auto",
          size,
          appearance: "always",
          // Default; keep explicit so transient errors auto-retry without unmount.
          retry: "auto",
          callback: (nextToken) => {
            if (cancelled) return;
            setChallengeHint(null);
            setToken(nextToken);
            onTokenChangeRef.current?.(nextToken);
          },
          "expired-callback": () => {
            if (cancelled) return;
            setChallengeHint(TURNSTILE_EXPIRED_HINT);
            clearToken();
            safeReset(widgetIdRef.current);
          },
          "timeout-callback": () => {
            if (cancelled) return;
            setChallengeHint(TURNSTILE_TIMEOUT_HINT);
            clearToken();
            safeReset(widgetIdRef.current);
          },
          "error-callback": () => {
            if (cancelled) return;
            // Soft fail: clear token only. Do not unmount — CF retry:"auto" continues.
            clearToken();
            setChallengeHint(TURNSTILE_TRANSIENT_ERROR_HINT);
          },
        });

        widgetIdRef.current = widgetId;
        renderedWidthRef.current = measured;
        renderedSizeRef.current = size;
        setActiveSize(size);
        setScriptFailed(false);
        clearToken();
      } catch {
        if (!cancelled) {
          setScriptReady(false);
          setScriptFailed(true);
        }
      }
    };

    mount();

    const observer = new ResizeObserver(() => {
      const nextWidth = slot.clientWidth;
      if (nextWidth <= 0 || cancelled) return;

      const nextSize = resolveWidgetSize(nextWidth);
      const sizeChanged = nextSize !== renderedSizeRef.current;
      const flexibleWidthChanged =
        nextSize === "flexible" && nextWidth !== renderedWidthRef.current;

      if (!sizeChanged && !flexibleWidthChanged && widgetIdRef.current) return;
      mount();
    });
    observer.observe(slot);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be gone with the container.
        }
      }
      widgetIdRef.current = null;
      renderedWidthRef.current = 0;
      renderedSizeRef.current = null;
      container.style.width = "";
      container.style.maxWidth = "";
    };
  }, [siteKey, scriptReady, retryKey]);

  function handleRetry() {
    setToken(null);
    onTokenChangeRef.current?.(null);
    setChallengeHint(null);
    setScriptFailed(false);
    setScriptReady(Boolean(typeof window !== "undefined" && window.turnstile));
    setRetryKey((key) => key + 1);
  }

  if (!siteKey) {
    return null;
  }

  const reservedMinHeight = activeSize === "compact" ? 140 : 65;

  return (
    <div className={cn("w-full min-w-0 overflow-visible", className)}>
      {!scriptFailed ? (
        <Script
          key={retryKey}
          src={TURNSTILE_SCRIPT_SRC}
          strategy="afterInteractive"
          onLoad={() => {
            setScriptReady(true);
            setScriptFailed(false);
          }}
          onError={() => {
            setScriptReady(false);
            setScriptFailed(true);
          }}
        />
      ) : null}
      {/* Reserved slot: flexible widget fills an integer-pixel host width;
          compact is used under 300px (official mobile size). No aria-label —
          plain divs cannot take aria-label (PageSpeed/Lighthouse), and the
          Turnstile iframe supplies its own accessible name. */}
      <div
        ref={slotRef}
        className="w-full min-w-0 overflow-visible"
        style={{ minHeight: scriptFailed ? undefined : reservedMinHeight }}
      >
        {!scriptFailed ? (
          <div ref={containerRef} className="min-w-0 overflow-visible" />
        ) : null}
      </div>
      {scriptFailed ? (
        <div className="flex flex-col gap-2" role="alert">
          <p className="text-sm text-red-700">{TURNSTILE_LOAD_FAILED_MESSAGE}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={handleRetry}
          >
            Prøv igjen
          </Button>
        </div>
      ) : null}
      {!scriptFailed && challengeHint ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {challengeHint}
        </p>
      ) : null}
    </div>
  );
});
