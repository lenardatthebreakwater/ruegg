import { homepageHeroMedia } from "@/lib/data/homepage-media";
import { cn } from "@/lib/utils";

const heroImageClassName =
  // Below veils (`z-[1]` media, `z-[2]` overlays) so readability overlays always win.
  // X stays center (stove in the right ~30% next to `w-[70%]` copy).
  // Mobile Y slightly below center so the stove sits a bit higher vs CTAs.
  // Never combine with a second `object-center` class — it can win the cascade.
  "absolute inset-0 z-[1] size-full object-cover object-[center_65%] md:object-center";

/**
 * Homepage hero stills swap with the document `.dark` class (next-themes).
 * Hidden theme variant uses `display: none` so browsers typically fetch only
 * the active image — same pattern as the navbar logos.
 */
export function HomepageHeroBackdrop() {
  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- AVIF-only hero; no WebP pair */}
      <img
        src={homepageHeroMedia.srcLight}
        alt={homepageHeroMedia.alt}
        fetchPriority="high"
        decoding="async"
        className={cn(heroImageClassName, "dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- AVIF-only hero; no WebP pair */}
      <img
        src={homepageHeroMedia.srcDark}
        alt={homepageHeroMedia.alt}
        fetchPriority="high"
        decoding="async"
        className={cn(heroImageClassName, "hidden dark:block")}
      />
      {/* Mobile: left 90% veil — holds opacity across the copy block (70% wide), fades out at the right edge. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[90%] bg-[linear-gradient(to_right,rgb(255_255_255/0.97)_0%,rgb(255_255_255/0.90)_45%,rgb(255_255_255/0.55)_75%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgb(10_10_10/0.98)_0%,rgb(10_10_10/0.90)_45%,rgb(10_10_10/0.60)_75%,transparent_100%)] md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] hidden bg-gradient-to-r from-background/60 from-0% via-background/55 via-[38%] to-transparent to-[72%] dark:from-background dark:via-background/88 md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-b from-transparent to-background sm:h-32"
        aria-hidden
      />
    </div>
  );
}
