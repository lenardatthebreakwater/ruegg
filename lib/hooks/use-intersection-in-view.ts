"use client";

import * as React from "react";

import { useValueChangeEffect } from "@/lib/hooks/effect-last";

type UseIntersectionInViewOptions = IntersectionObserverInit;

/** Returns whether `target` is currently intersecting the viewport. Defaults to `true` until observed. */
export function useIntersectionInView(
  target: Element | null,
  options?: UseIntersectionInViewOptions
) {
  const [isInView, setIsInView] = React.useState(true);
  const optionsRef = React.useRef(options);

  React.useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useValueChangeEffect(target, (node) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0, ...optionsRef.current }
    );

    observer.observe(node);
    return () => observer.disconnect();
  });

  return isInView;
}

/**
 * True only after the user has scrolled *past* `target` (its top is above the
 * viewport). Stays false when the target is still below the fold — so sticky
 * CTAs do not appear prematurely at the top of long pages.
 */
export function useHasScrolledPast(
  target: Element | null,
  options?: UseIntersectionInViewOptions
) {
  const [hasScrolledPast, setHasScrolledPast] = React.useState(false);
  const optionsRef = React.useRef(options);

  React.useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useValueChangeEffect(target, (node) => {
    if (!node) {
      setHasScrolledPast(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasScrolledPast(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      },
      { threshold: 0, ...optionsRef.current }
    );

    observer.observe(node);
    return () => observer.disconnect();
  });

  return hasScrolledPast;
}
