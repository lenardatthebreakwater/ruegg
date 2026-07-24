import type { PopulaereSokHubId } from "@/lib/populaere-sok/types";

/** WooCommerce product category slug + carousel heading for “Utvalgte” brand picks. */
export type BrandUtvalgteCarousel = {
  categorySlug: string;
  title: string;
};

const nordpeisUtvalgte = {
  categorySlug: "nordpeis-utvalgte",
  title: "Nordpeis",
} satisfies BrandUtvalgteCarousel;

const aduroUtvalgte = {
  categorySlug: "aduro-utvalgte",
  title: "Aduro",
} satisfies BrandUtvalgteCarousel;

const dovreUtvalgte = {
  categorySlug: "dovre-utvalgte",
  title: "Dovre",
} satisfies BrandUtvalgteCarousel;

const element4Utvalgte = {
  categorySlug: "element4-utvalgte",
  title: "Noen utvalgte Element 4 gasspeiser",
} satisfies BrandUtvalgteCarousel;

/** Ordered carousels on `/peisovn/` — titles are SEO section headings for that hub. */
export const peisovnUtvalgteCarousels: readonly BrandUtvalgteCarousel[] = [
  {
    ...nordpeisUtvalgte,
    title: "Utvalgte peisovner fra Nordpeis",
  },
  {
    ...aduroUtvalgte,
    title: "Utvalgte peisovner fra Aduro",
  },
  {
    ...dovreUtvalgte,
    title: "Utvalgte peisovner fra Dovre",
  },
];

/** Single carousel config for brand hub landings that use one “Utvalgte” category each. */
export const brandUtvalgteCarouselByHubId: Record<
  Extract<PopulaereSokHubId, "nordpeis" | "aduro" | "dovre-peis" | "element4">,
  BrandUtvalgteCarousel
> = {
  nordpeis: nordpeisUtvalgte,
  aduro: aduroUtvalgte,
  "dovre-peis": dovreUtvalgte,
  element4: element4Utvalgte,
};
