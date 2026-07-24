import type { HubHomeHeroContent, HubSeo } from "./types";

const IMG = "/images/campaigns/nordpeis-kampanje";

export const NORDPEIS_KAMPANJE_UNIKE_TILBUD_PATH =
  "/nordpeis-kampanje-unike-tilbud/" as const;

export const nordpeisKampanjeSeo: HubSeo = {
  title: "Nordpeis-kampanje – unike tilbud på peis og ovn",
  description:
    "Nordpeis-kampanje hos Peisbutikken. Unike tilbud på norsk peismerke – peisovn, vedovn og komplette peisløsninger. Se kampanjen og showroom i Bærum.",
};

export const nordpeisKampanjeHero: HubHomeHeroContent = {
  eyebrow: "Kampanje",
  title: "Nordpeis-kampanje – unike tilbud",
  description:
    "Nordpeis er et norsk peismerke etablert i 1984, med fokus på vedfyrt oppvarming og komplette peisløsninger. Som Norges største produsent av peiser og vedovner leverer Nordpeis mange populære peiser! 🍂🔥",
  ctaLabel: "Kontakt oss",
  ctaHref: "#kontakt",
  imageSrc: `${IMG}/hero.webp`,
  imageAlt:
    "Nordpeis Monaco peis i moderne stue – lifestyle hos Peisbutikken",
};

/** Promotional strip below hero (design + campaign dates on artwork). */
export const nordpeisKampanjeBanner = {
  imageSrc: `${IMG}/campaign-banner.webp`,
  imageAlt:
    "Nordpeis-kampanje: «Design som varmer i høstmørket», kampanjedager 20. oktober–2. november 2025, hvit peis i moderne stue",
  width: 1024,
  height: 576,
} as const;
