"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import {
  SHELL_CTA_PRIMARY,
  SHELL_CTA_SECONDARY_ON_MEDIA,
} from "@/components/homepage/shell/shell-cta";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const HERO_VIDEO_SRC = "/videos/ruegg-hero.mp4";
const HERO_POSTER_SRC = "/videos/ruegg-hero-poster.jpg";

/**
 * Strategy A hero - full-bleed single local video, catalog + lead CTAs.
 */
export function HomeShellHero() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="home-shell-hero-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 size-full object-cover object-center motion-reduce:hidden"
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          muted
          playsInline
          loop
          autoPlay
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- single JPG frame for reduced-motion fallback */}
        <img
          src={HERO_POSTER_SRC}
          alt=""
          aria-hidden
          className="absolute inset-0 hidden size-full object-cover object-center motion-reduce:block"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[color:var(--ruegg-swiss-deep)]/80 via-[color:var(--ruegg-swiss-ink)]/50 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--ruegg-swiss-deep)]/55 via-transparent to-[color:var(--ruegg-swiss-deep)]/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[color:var(--ruegg-swiss-ink)]/40 md:hidden"
        aria-hidden
      />

      <ContainedLayout
        as="div"
        className={cn(
          SHELL_CONTENT_MAX,
          "relative z-10 flex min-h-[100dvh] flex-col justify-end pb-16 pt-24 md:justify-center md:pb-24 md:pt-20",
        )}
      >
        <motion.div
          className="max-w-xl"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className="font-display text-sm font-medium tracking-[0.08em] text-white/80">
            Rüegg
          </p>
          <h1
            id="home-shell-hero-heading"
            className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Sveitsiske peiser for norske hjem
          </h1>
          <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-white/85 sm:text-lg">
            Utforsk peiser, peisinnsatser og utepeiser. Få råd og tilbud fra oss.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className={SHELL_CTA_PRIMARY}>
              <Link href="/shop/">Utforsk peiser</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={SHELL_CTA_SECONDARY_ON_MEDIA}
            >
              <Link href="/kontakt-oss/">Be om tilbud</Link>
            </Button>
          </div>
        </motion.div>
      </ContainedLayout>
    </section>
  );
}
