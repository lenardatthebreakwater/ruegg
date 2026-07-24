/** Shared content shapes for Populære søk hub landing pages (Norwegian copy in data files). */

export type HubSeo = {
  title: string;
  description: string;
};

export type HubHomeHeroContent = {
  title: string;
  /** Shown under the main title, above the body copy (optional). */
  subtitle?: string;
  /** One or more lead paragraphs below the title. */
  description: string | string[];
  ctaLabel: string;
  ctaHref: string;
  /**
   * Static image for image-only heroes. When `backgroundVideoSrc` is set, this still supplies
   * the `Image` poster/fallback (unless `posterImageSrc` is provided for video poster only).
   */
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  /**
   * When set, the hub home hero shows a looping background video (with poster + image fallback).
   */
  backgroundVideoSrc?: string;
  /**
   * Optional poster URL for the video layer; when omitted, `imageSrc` is used as the poster source.
   */
  posterImageSrc?: string;
};

export type HubProseBlock = {
  title: string;
  paragraphs: string[];
  /** Optional bullet list rendered after paragraphs (e.g. key benefits). */
  bulletItems?: string[];
};

export type HubBrandTeaserContent = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  /**
   * `cover` fills the image frame (cropping if aspect ratios differ). Default `contain` keeps logos/padded layout.
   */
  imageObjectFit?: "cover" | "contain";
  /** Optional extra classes on the logo image (e.g. scale to match sibling brands). */
  imageClassName?: string;
  /** Fit logo by height inside compact image frames (for square logos beside wide ones). */
  imageLayout?: "fill" | "height-fit";
};

export type HubFeatureSectionBlock = {
  title: string;
  description: string;
  /** Optional bullet list (e.g. “Høydepunkter”) — rendered as a semantic <ul> after the h3. */
  listItems?: string[];
};

export type HubFeatureSplitContent = {
  /** Optional section anchor (e.g. in-page CTA targets). */
  id?: string;
  /** Lead copy above the first `#` section when using `parseHubFeatureProse`. */
  preamble?: string;
  sections: HubFeatureSectionBlock[];
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Lucide icon keys for `HubFeatureSpecSplitSection` stat cards (mapped in the component). */
export type HubFeatureSpecIconKey = "ruler" | "weight" | "zap" | "home";

export type HubFeatureSpecStat = {
  label: string;
  value: string;
  iconKey: HubFeatureSpecIconKey;
};

export type HubFeatureSpecSplitContent = {
  id?: string;
  title: string;
  stats: HubFeatureSpecStat[];
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HubLandingPageContent = {
  seo: HubSeo;
  hero: HubHomeHeroContent;
  whyChoose: HubProseBlock;
  /** Optional heading + lead above the category teaser cards (e.g. Peis hub). */
  brandTeaserIntro?: {
    title: string;
    description?: string;
  };
  brandTeaserImageAspectClass?: string;
  brandTeasers: HubBrandTeaserContent[];
  feature: HubFeatureSplitContent;
};
