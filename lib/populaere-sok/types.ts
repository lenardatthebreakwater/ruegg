export type PopulaereSokHubId =
  | "peis"
  | "peisinnsats"
  | "peisovn"
  | "dovre-peis"
  | "utepeis"
  | "vedovn"
  | "hajduk"
  | "element4"
  | "nordpeis"
  | "stalpipe"
  | "aduro";

export type PopulaereSokHub = {
  id: PopulaereSokHubId;
  /** Public path with trailing slash, e.g. `/peis/` */
  path: `/${string}/`;
  /** Full card / page heading (Norwegian) */
  menuTitle: string;
  /** Short label for breadcrumbs */
  breadcrumbLabel: string;
  /** SEO title (browser tab); may be shorter than menuTitle */
  metaTitle: string;
  metaDescription: string;
  /** Path under /public, e.g. `/images/populaere-sok/peis.webp` */
  menuImageSrc: string;
  menuImageAlt: string;
  /** Primary CTA on the hub menu card */
  ctaLabel: string;
};
