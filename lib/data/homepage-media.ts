/**
 * Local homepage images live in `public/images/homepage/`.
 * Replace files on disk; keep `src` paths in sync with actual filenames/extensions.
 *
 * Archived (not deployed) former hero video/stills: `assets/archive/hero/`.
 */
export const homepageHeroMedia = {
  /** Light theme hero (AVIF). */
  srcLight: "/images/homepage/hero-day.avif",
  /** Dark theme hero (AVIF). */
  srcDark: "/images/homepage/hero-night.avif",
  alt: "Stue med peis — varm og innbydende atmosfære",
} as const;
