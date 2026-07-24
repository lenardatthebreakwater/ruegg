"use client";

import { flushSync } from "react-dom";

const THEME_VT_X = "--theme-vt-x";
const THEME_VT_Y = "--theme-vt-y";

export type ThemeViewTransitionOrigin = {
  clientX: number;
  clientY: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setClipOrigin(origin?: ThemeViewTransitionOrigin): void {
  const root = document.documentElement;
  if (!origin) {
    root.style.setProperty(THEME_VT_X, "50%");
    root.style.setProperty(THEME_VT_Y, "50%");
    return;
  }
  const { innerWidth, innerHeight } = window;
  const xPct = innerWidth > 0 ? (origin.clientX / innerWidth) * 100 : 50;
  const yPct = innerHeight > 0 ? (origin.clientY / innerHeight) * 100 : 50;
  root.style.setProperty(THEME_VT_X, `${xPct}%`);
  root.style.setProperty(THEME_VT_Y, `${yPct}%`);
}

/**
 * Runs `update` inside a document view transition when supported and motion is allowed.
 * Sets CSS variables for a circular reveal origin (viewport percentages).
 */
export function startViewThemeTransition(
  update: () => void,
  origin?: ThemeViewTransitionOrigin
): void {
  if (typeof document === "undefined") {
    return;
  }

  if (prefersReducedMotion()) {
    update();
    return;
  }

  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }

  setClipOrigin(origin);

  document.startViewTransition(() => {
    flushSync(update);
  });
}
