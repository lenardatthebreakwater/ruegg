"use client";

/**
 * My Account micro-animation icons.
 *
 * Shared trigger/factory live in `@/components/icons/animated-icon`.
 * Import `useAnimatedIcon` / `ANIMATED_ICON_PROPS` from there (or re-exports
 * below) for call sites.
 *
 * ```tsx
 * const { ref, triggerProps } = useAnimatedIcon();
 *
 * <Link href="..." {...triggerProps}>
 *   <AccountEyeIcon ref={ref} {...ANIMATED_ICON_PROPS} />
 *   Label
 * </Link>
 * ```
 */

import {
  CreditCardIcon,
  FlameIcon,
  Trash2Icon,
} from "@animateicons/react/lucide";
import { motion } from "motion/react";

import {
  createAnimatedMotionIcon,
  MOTION_SCALE,
  motionPlayState,
  OUTER_IDLE,
  outerScaleKeyframes,
  outerTransition,
  type AnimatedIconComponent,
} from "@/components/icons/animated-icon";

export {
  ANIMATED_ICON_PROPS,
  useAnimatedIcon,
  type AnimatedIconComponent,
  type AnimatedIconHandle,
} from "@/components/icons/animated-icon";

/** Reference — card tilt + magnetic stripe slide + number bar draw-in. */
export const AccountCreditCardIcon =
  CreditCardIcon as AnimatedIconComponent;

/** Flame path dash flicker (silhouette stays; internal stroke accent). */
export const AccountFlameIcon = FlameIcon as AnimatedIconComponent;

/**
 * Trash can: slight body bounce + lid lifts open + inner bars pulse
 * (CreditCard-style internal accent — not tilt-only).
 */
export const AccountTrash2Icon = Trash2Icon as AnimatedIconComponent;

/**
 * Lucide eye: outline stays static; pupil scans left–right only
 * (no eyelid scaleY blink — AnimateIcons Eye hard-blinks and distorts).
 */
export const AccountEyeIcon = createAnimatedMotionIcon(
  "AccountEyeIcon",
  ({ size, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      { scale: OUTER_IDLE.scale },
      { scale: OUTER_IDLE.scale },
      { duration: 0.15 }
    );
    const accent = motionPlayState(
      playing,
      { x: [0, 1.5, -1.5, 0] },
      { x: 0 },
      {
        duration: 1.2 * duration,
        ease: "easeInOut",
      },
      { duration: 0.15 }
    );

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          animate={accent.animate}
          transition={accent.transition}
        />
      </motion.svg>
    );
  }
);

/**
 * Closed lucide Package silhouette; sealing-tape stroke draws in on hover
 * (CreditCard-style internal accent). Not PackageOpen.
 */
export const AccountPackageIcon = createAnimatedMotionIcon(
  "AccountPackageIcon",
  ({ size, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -4, 2, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.account),
        x: [0, -0.4, 0],
        y: [0, -0.3, 0],
      },
      {
        rotate: OUTER_IDLE.rotate,
        scale: OUTER_IDLE.scale,
        x: OUTER_IDLE.x,
        y: OUTER_IDLE.y,
      },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { pathLength: [0, 1], opacity: [0, 1, 0.9] },
      { pathLength: 0, opacity: 0 },
      {
        duration: 0.5 * duration,
        ease: "easeInOut",
        delay: 0.18 * duration,
      }
    );

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
      >
        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
        <path d="M12 22V12" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <motion.path
          d="m7.5 4.27 9 5.15"
          animate={accent.animate}
          transition={accent.transition}
        />
      </motion.svg>
    );
  }
);

/** Pin outline stays; center dot pulses (internal accent). */
export const AccountMapPinIcon = createAnimatedMotionIcon(
  "AccountMapPinIcon",
  ({ size, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -3, 2, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.account),
        y: [0, -0.5, 0],
      },
      {
        rotate: OUTER_IDLE.rotate,
        scale: OUTER_IDLE.scale,
        y: OUTER_IDLE.y,
      },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { scale: [1, 1.22, 1], opacity: [1, 0.72, 1] },
      { scale: 1, opacity: 1 },
      {
        duration: 0.55 * duration,
        ease: "easeInOut",
        delay: 0.1 * duration,
      }
    );

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
      >
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <motion.circle
          cx="12"
          cy="10"
          r="3"
          animate={accent.animate}
          transition={accent.transition}
          style={{ transformOrigin: "12px 10px" }}
        />
      </motion.svg>
    );
  }
);

/**
 * Key silhouette stays; turns on the bow + hole pulse (bit accent without
 * full path redraw / vanish).
 */
export const AccountKeyRoundIcon = createAnimatedMotionIcon(
  "AccountKeyRoundIcon",
  ({ size, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -10, 6, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.account),
      },
      { rotate: OUTER_IDLE.rotate, scale: OUTER_IDLE.scale },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { scale: [1, 1.4, 0.95, 1] },
      { scale: 1 },
      {
        duration: 0.55 * duration,
        ease: "easeInOut",
        delay: 0.1 * duration,
      }
    );

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        style={{ transformOrigin: "16.5px 7.5px" }}
      >
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
        <motion.circle
          cx="16.5"
          cy="7.5"
          r="0.5"
          fill="currentColor"
          animate={accent.animate}
          transition={accent.transition}
          style={{ transformOrigin: "16.5px 7.5px" }}
        />
      </motion.svg>
    );
  }
);

/**
 * Bubble stays solid; plus mark pops (never full vanish / recolor).
 */
export const AccountMessageIcon = createAnimatedMotionIcon(
  "AccountMessageIcon",
  ({ size, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -3, 2, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.account),
        y: [0, -0.4, 0],
      },
      {
        rotate: OUTER_IDLE.rotate,
        scale: OUTER_IDLE.scale,
        y: OUTER_IDLE.y,
      },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { scale: [1, 1.28, 1], opacity: 1 },
      { scale: 1, opacity: 1 },
      {
        duration: 0.5 * duration,
        ease: "easeInOut",
        delay: 0.08 * duration,
      }
    );

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
      >
        <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          style={{ transformOrigin: "12px 11px" }}
        >
          <path d="M12 8v6" />
          <path d="M9 11h6" />
        </motion.g>
      </motion.svg>
    );
  }
);
