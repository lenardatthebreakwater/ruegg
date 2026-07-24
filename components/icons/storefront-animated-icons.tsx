"use client";

/**
 * Storefront micro-animation icons (header, top bar, PDP purchase highlights).
 * Uses AnimateIcons where available; custom motion fallbacks otherwise.
 *
 * Custom icons must use the declarative `playing` API from
 * `createAnimatedMotionIcon` + `motionPlayState` (not useAnimationControls).
 */

import {
  MessageCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UserIcon,
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
import { cn } from "@/lib/utils";

/** Magnifier: AnimateIcons Search (handle nudge / lens pulse). */
export const AnimatedSearchIcon = SearchIcon as AnimatedIconComponent;

/** Account silhouette: AnimateIcons User. */
export const AnimatedUserIcon = UserIcon as AnimatedIconComponent;

/** Cart body tilt + basket accent: AnimateIcons ShoppingCart. */
export const AnimatedShoppingCartIcon =
  ShoppingCartIcon as AnimatedIconComponent;

/**
 * Stacked layers — calm in-button fan (not AnimateIcons Layers).
 * AnimateIcons Layers holds y: −4/−8/−12 while hovering and clips inside
 * Button `overflow-hidden`. This timeline stays ≤1.5px and settles at rest.
 */
export const AnimatedLayersIcon = createAnimatedMotionIcon(
  "AnimatedLayersIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      { scale: outerScaleKeyframes(1.03) },
      { scale: OUTER_IDLE.scale },
      {
        duration: 0.55 * duration,
        ease: "easeInOut",
      }
    );

    const layerMotion = (peakY: number, delayFrac: number) =>
      motionPlayState(
        playing,
        { y: [0, peakY, 0] },
        { y: OUTER_IDLE.y },
        {
          duration: 0.55 * duration,
          ease: "easeInOut",
          delay: delayFrac * duration,
        }
      );

    // Top → bottom: tiny staggered bob, all keyframes end at y:0.
    const top = layerMotion(-1.5, 0);
    const mid = layerMotion(-1, 0.04);
    const bottom = layerMotion(-0.5, 0.08);

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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ scale: 1 }}
        style={{ transformOrigin: "12px 12px", overflow: "visible" }}
      >
        <motion.path
          d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
          animate={top.animate}
          transition={top.transition}
          initial={{ y: 0 }}
        />
        <motion.path
          d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
          animate={mid.animate}
          transition={mid.transition}
          initial={{ y: 0 }}
        />
        <motion.path
          d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
          animate={bottom.animate}
          transition={bottom.transition}
          initial={{ y: 0 }}
        />
      </motion.svg>
    );
  }
);

/**
 * Chat bubble pulse: AnimateIcons MessageCircle
 * (closest AnimateIcons match to Lucide MessageSquare / ask-expert).
 */
export const AnimatedMessageCircleIcon =
  MessageCircleIcon as AnimatedIconComponent;

/** Shield + check draw: AnimateIcons ShieldCheck. */
export const AnimatedShieldCheckIcon =
  ShieldCheckIcon as AnimatedIconComponent;

/**
 * Theme light — custom sun spin + ray pulse.
 * AnimateIcons Sun (±2° / 1.06 scale) is effectively invisible at ~20px.
 * Outer keyframes settle at identity (see animated-icon motion rule).
 */
export const AnimatedSunIcon = createAnimatedMotionIcon(
  "AnimatedSunIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -14, 8, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefront),
      },
      { rotate: OUTER_IDLE.rotate, scale: OUTER_IDLE.scale },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { opacity: [1, 0.55, 1], scale: [1, 1.16, 1] },
      { opacity: 1, scale: 1 },
      {
        duration: 0.6 * duration,
        ease: "easeInOut",
        delay: 0.04 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1 }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <circle cx="12" cy="12" r="4" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          initial={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </motion.g>
      </motion.svg>
    );
  }
);

/**
 * Theme dark — custom moon tip + bob.
 * AnimateIcons Moon (scale 0.95 / y:1px) is effectively invisible at ~20px.
 * Outer keyframes settle at identity (see animated-icon motion rule).
 */
export const AnimatedMoonIcon = createAnimatedMotionIcon(
  "AnimatedMoonIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -14, 6, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefront),
        y: [0, -3, 0],
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
      { opacity: [1, 0.65, 1] },
      { opacity: 1 },
      {
        duration: 0.55 * duration,
        ease: "easeInOut",
        delay: 0.05 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1, y: 0 }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <motion.path
          d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
          animate={accent.animate}
          transition={accent.transition}
          initial={{ opacity: 1 }}
        />
      </motion.svg>
    );
  }
);

/**
 * Newspaper — page tip + masthead pulse (no Newspaper in AnimateIcons).
 * Outer silhouette returns to identity; masthead/lines carry the accent.
 */
export const AnimatedNewspaperIcon = createAnimatedMotionIcon(
  "AnimatedNewspaperIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -8, 4, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefrontSoft),
        y: [0, -2, 0],
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
      { opacity: [1, 0.55, 1], y: [0, -1.5, 0] },
      { opacity: 1, y: 0 },
      {
        duration: 0.55 * duration,
        ease: "easeInOut",
        delay: 0.06 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1, y: 0 }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          initial={{ opacity: 1, y: 0 }}
        >
          <rect width="8" height="4" x="10" y="6" rx="1" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
        </motion.g>
      </motion.svg>
    );
  }
);

/**
 * Store facade bob + door swing-open hint (internal accent).
 * No Store icon in AnimateIcons — custom motion.
 */
export const AnimatedStoreIcon = createAnimatedMotionIcon(
  "AnimatedStoreIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -8, 5, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefront),
        y: [0, -4, 0],
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
      // Door swings open from left hinge, then settles closed.
      { rotate: [0, -32, 0], x: [0, 1.5, 0] },
      { rotate: 0, x: 0 },
      {
        duration: 0.65 * duration,
        ease: "easeInOut",
        delay: 0.05 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1, y: 0 }}
      >
        <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
        <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
        <motion.path
          d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"
          animate={accent.animate}
          transition={accent.transition}
          initial={{ rotate: 0, x: 0 }}
          style={{ transformOrigin: "10px 21px" }}
        />
      </motion.svg>
    );
  }
);

/**
 * Badge outline stays; percent mark pops (no BadgePercent in AnimateIcons).
 */
export const AnimatedBadgePercentIcon = createAnimatedMotionIcon(
  "AnimatedBadgePercentIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      { rotate: [0, -4, 3, 0], scale: [1, 1.03, 1] },
      { rotate: 0, scale: 1 },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] },
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1 }}
      >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          initial={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <path d="m15 9-6 6" />
          <path d="M9 9h.01" />
          <path d="M15 15h.01" />
        </motion.g>
      </motion.svg>
    );
  }
);

/**
 * Wrench turns in place (single-path Lucide; no Wrench in AnimateIcons).
 */
export const AnimatedWrenchIcon = createAnimatedMotionIcon(
  "AnimatedWrenchIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -18, 10, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefrontSoft),
      },
      { rotate: OUTER_IDLE.rotate, scale: OUTER_IDLE.scale },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { opacity: [1, 0.85, 1] },
      { opacity: 1 },
      {
        duration: 0.5 * duration,
        ease: "easeInOut",
        delay: 0.06 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1 }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <motion.path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"
          animate={accent.animate}
          transition={accent.transition}
          initial={{ opacity: 1 }}
        />
      </motion.svg>
    );
  }
);

/**
 * Delivery truck rolls forward (no Truck in AnimateIcons).
 * Body translates; wheels spin as accent.
 */
export const AnimatedTruckIcon = createAnimatedMotionIcon(
  "AnimatedTruckIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      { x: [0, 3.5, -1, 0], y: [0, -1.5, 0], scale: [1, 1.1, 1] },
      { x: 0, y: 0, scale: 1 },
      outerTransition(duration)
    );
    const accent = motionPlayState(
      playing,
      { rotate: [0, 360] },
      { rotate: 0 },
      {
        duration: 0.7 * duration,
        ease: "easeInOut",
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ x: 0, y: 0, scale: 1 }}
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "12px 18px" }}
        >
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </motion.g>
      </motion.svg>
    );
  }
);

/**
 * Brick wall nudge + mortar-line pulse (no BrickWall in AnimateIcons).
 */
export const AnimatedBrickWallIcon = createAnimatedMotionIcon(
  "AnimatedBrickWallIcon",
  ({ size, svgClassName, playing, duration }) => {
    const outer = motionPlayState(
      playing,
      {
        rotate: [0, -6, 5, 0],
        scale: outerScaleKeyframes(MOTION_SCALE.storefront),
        y: [0, -2, 0],
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
      { x: [0, 1.5, -1, 0], opacity: [1, 0.7, 1] },
      { x: 0, opacity: 1 },
      {
        duration: 0.6 * duration,
        ease: "easeInOut",
        delay: 0.05 * duration,
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
        className={cn(svgClassName)}
        aria-hidden
        animate={outer.animate}
        transition={outer.transition}
        initial={{ rotate: 0, scale: 1, y: 0 }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M12 9v6" />
        <path d="M16 15v6" />
        <path d="M16 3v6" />
        <path d="M8 15v6" />
        <path d="M8 3v6" />
        <motion.g
          animate={accent.animate}
          transition={accent.transition}
          initial={{ x: 0, opacity: 1 }}
        >
          <path d="M3 15h18" />
          <path d="M3 9h18" />
        </motion.g>
      </motion.svg>
    );
  }
);
