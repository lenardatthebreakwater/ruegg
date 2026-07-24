"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionValue, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

type UseGsapScrollProgressResult = {
  setTrackRef: (node: HTMLLIElement | null) => void;
  progress: MotionValue<number>;
};

/**
 * Maps scroll distance through a tall track (start→end) to a 0→1 MotionValue.
 * Reverses automatically on scroll up.
 */
export function useGsapScrollProgress(
  enabled: boolean,
): UseGsapScrollProgressResult {
  const [trackEl, setTrackEl] = useState<HTMLLIElement | null>(null);
  const progress = useMotionValue(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      progress.set(1);
      return;
    }

    if (!trackEl) return;

    // Proxy + tween so scrub reliably drives 0→1 (create()+scrub with no
    // animation was leaving progress stuck near 0).
    const proxy = { t: 0 };
    const tween = gsap.fromTo(
      proxy,
      { t: 0 },
      {
        t: 1,
        ease: "none",
        scrollTrigger: {
          trigger: trackEl,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            progress.set(proxy.t);
          },
        },
      },
    );

    const st = tween.scrollTrigger;
    if (st) progress.set(st.progress);

    const refresh = () => ScrollTrigger.refresh();
    refresh();
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [enabled, progress, trackEl]);

  return { setTrackRef: setTrackEl, progress };
}
