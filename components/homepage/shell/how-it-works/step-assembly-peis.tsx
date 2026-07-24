"use client";

import { motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";

type StepAssemblyPeisProps = {
  progress: MotionValue<number>;
  onDeep?: boolean;
};

/**
 * Peis parts scrub together with scroll; reverse on scroll up.
 * Transforms finish by ~0.75 so the fireplace fully assembles before handoff.
 */
export function StepAssemblyPeis({
  progress,
  onDeep = false,
}: StepAssemblyPeisProps) {
  const reduce = useReducedMotion();
  const ink = onDeep ? "var(--ruegg-swiss-cream)" : "var(--ruegg-swiss-ink)";
  const olive = onDeep ? "var(--ruegg-swiss-taupe)" : "var(--ruegg-swiss-olive)";
  const deep = "var(--ruegg-swiss-deep)";
  const cream = "var(--ruegg-swiss-cream)";
  const taupe = "var(--ruegg-swiss-taupe)";

  const mantelY = useTransform(progress, [0, 0.35], [-40, 0]);
  const leftX = useTransform(progress, [0, 0.4], [-36, 0]);
  const rightX = useTransform(progress, [0, 0.4], [36, 0]);
  const insertY = useTransform(progress, [0.05, 0.5], [32, 0]);
  const insertOpacity = useTransform(progress, [0.02, 0.35], [0.3, 1]);
  const glassOpacity = useTransform(progress, [0.25, 0.55], [0, 1]);
  const flameOpacity = useTransform(progress, [0.4, 0.7], [0, 1]);
  const hearthY = useTransform(progress, [0.1, 0.55], [28, 0]);
  const glowOpacity = useTransform(progress, [0.5, 0.75], [0, 0.65]);

  if (reduce) {
    return (
      <div className="w-full max-w-sm overflow-hidden" aria-hidden>
        <AssembledSvg
          ink={ink}
          olive={olive}
          deep={deep}
          cream={cream}
          taupe={taupe}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 320 380"
        className="h-auto w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.ellipse
          cx="160"
          cy="300"
          rx="110"
          ry="18"
          fill={taupe}
          style={{ opacity: glowOpacity }}
        />
        <motion.rect
          x="36"
          y="40"
          width="248"
          height="14"
          rx="2"
          fill={ink}
          style={{ y: mantelY }}
        />
        <motion.path
          d="M48 54h24v254H48z"
          stroke={ink}
          strokeWidth="2.5"
          fill="none"
          style={{ x: leftX }}
        />
        <motion.path
          d="M248 54h24v254h-24z"
          stroke={ink}
          strokeWidth="2.5"
          fill="none"
          style={{ x: rightX }}
        />
        <motion.g style={{ y: insertY, opacity: insertOpacity }}>
          <rect
            x="88"
            y="100"
            width="144"
            height="160"
            rx="4"
            stroke={ink}
            strokeWidth="2"
            fill={deep}
          />
        </motion.g>
        <motion.rect
          x="104"
          y="116"
          width="112"
          height="112"
          rx="2"
          fill={`color-mix(in oklab, ${cream} 35%, transparent)`}
          stroke={taupe}
          strokeWidth="1.25"
          style={{ opacity: glassOpacity }}
        />
        <motion.g style={{ opacity: flameOpacity }}>
          <path
            d="M160 210c-10-18-8-32 0-46 12 10 22 24 18 40-2 8-10 12-18 6z"
            fill={cream}
          />
          <path
            d="M148 214c-6-12-4-22 2-32 8 8 14 16 12 28-1 6-6 8-14 4z"
            fill={taupe}
          />
          <path
            d="M172 212c6-14 4-24-2-34-8 9-12 18-10 30 1 6 6 8 12 4z"
            fill={taupe}
          />
        </motion.g>
        <motion.rect
          x="72"
          y="268"
          width="176"
          height="22"
          rx="2"
          fill={olive}
          style={{ y: hearthY }}
        />
      </svg>
    </div>
  );
}

function AssembledSvg({
  ink,
  olive,
  deep,
  cream,
  taupe,
}: {
  ink: string;
  olive: string;
  deep: string;
  cream: string;
  taupe: string;
}) {
  return (
    <svg viewBox="0 0 320 380" className="h-auto w-full" fill="none">
      <ellipse cx="160" cy="300" rx="110" ry="18" fill={taupe} opacity="0.65" />
      <rect x="36" y="40" width="248" height="14" rx="2" fill={ink} />
      <path d="M48 54h24v254H48z" stroke={ink} strokeWidth="2.5" />
      <path d="M248 54h24v254h-24z" stroke={ink} strokeWidth="2.5" />
      <rect
        x="88"
        y="100"
        width="144"
        height="160"
        rx="4"
        stroke={ink}
        strokeWidth="2"
        fill={deep}
      />
      <rect
        x="104"
        y="116"
        width="112"
        height="112"
        rx="2"
        fill={`color-mix(in oklab, ${cream} 35%, transparent)`}
        stroke={taupe}
        strokeWidth="1.25"
      />
      <path
        d="M160 210c-10-18-8-32 0-46 12 10 22 24 18 40-2 8-10 12-18 6z"
        fill={cream}
      />
      <path
        d="M148 214c-6-12-4-22 2-32 8 8 14 16 12 28-1 6-6 8-14 4z"
        fill={taupe}
      />
      <path
        d="M172 212c6-14 4-24-2-34-8 9-12 18-10 30 1 6 6 8 12 4z"
        fill={taupe}
      />
      <rect x="72" y="268" width="176" height="22" rx="2" fill={olive} />
    </svg>
  );
}
