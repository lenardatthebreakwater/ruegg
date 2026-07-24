"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import { useMountEffect } from "@/lib/hooks/effect-last";
import { cn } from "@/lib/utils";

type LazyTurnstileWidgetProps = {
  className?: string;
  onTokenChange?: (token: string | null) => void;
  /** Root margin for when to mount the real widget + CF script. */
  rootMargin?: string;
};

/**
 * Mounts Turnstile only when near the viewport (or on first focus inside the host).
 * Avoids loading challenges.cloudflare.com on first paint for below-fold contact forms.
 */
export const LazyTurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  LazyTurnstileWidgetProps
>(function LazyTurnstileWidget(
  { className, onTokenChange, rootMargin = "200px 0px" },
  ref
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<TurnstileWidgetHandle>(null);
  const [mounted, setMounted] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => innerRef.current?.reset(),
    getToken: () => innerRef.current?.getToken() ?? null,
  }));

  useMountEffect(() => {
    const host = hostRef.current;
    if (!host || mounted) return;

    const mount = () => setMounted(true);

    if (typeof IntersectionObserver === "undefined") {
      mount();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          mount();
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(host);

    const onFocusIn = () => {
      mount();
      observer.disconnect();
    };
    host.addEventListener("focusin", onFocusIn, { once: true });

    return () => {
      observer.disconnect();
      host.removeEventListener("focusin", onFocusIn);
    };
  });

  return (
    <div
      ref={hostRef}
      className={cn("w-full min-w-0 overflow-visible", className)}
      style={{ minHeight: 65 }}
    >
      {mounted ? (
        <TurnstileWidget ref={innerRef} onTokenChange={onTokenChange} />
      ) : null}
    </div>
  );
});
