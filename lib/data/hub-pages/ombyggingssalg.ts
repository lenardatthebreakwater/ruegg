import type { HubHomeHeroContent, HubSeo } from "./types";

/** WooCommerce product category slug for this landing page (Peisoutlet). */
export const OMBYGGINGSSALG_CATEGORY_SLUG = "peisoutlet";

export const OMBYGGINGSSALG_PAGE_PATH = "/ombyggingssalg/" as const;

export const ombyggingssalgSeo: HubSeo = {
  title: "Ombyggingssalg – utstillingsmodeller og outlet",
  description:
    "Ombyggingssalg på utstillingsmodeller og outlet. Sterke priser på peisovn og vedovn – begrenset lager. Se modellene i showroom i Bærum, eller kjøp online.",
};

export const ombyggingssalgHero: HubHomeHeroContent = {
  title: "Ombyggingssalg",
  subtitle: "Utstillingsmodeller og outlet til sterke priser",
  description:
    "Vi har ombyggingssalg på utvalgte utstillingsmodeller og outlet-produkter. Her finner du peisovner og vedovner til nedsatt pris – ofte med synlige merker fra butikk. Tilbudet gjelder kun så langt lageret rekker. Alle utstillingsmodeller MÅ hentes hos oss.",
  eyebrow: "Tilbud",
  ctaLabel: "Kontakt oss",
  ctaHref: "#kontakt",
  imageSrc: "/images/hub-pages/ombyggingssalg/hero.webp",
  imageAlt:
    "Peisovn i ombyggingssalg hos Peisbutikken.no",
};

export const ombyggingssalgCarouselTitle = "Produkter i ombyggingssalg";

export const ombyggingssalgCarouselDescription =
  "OBS: Utstillings- og outlet-modeller. Begrenset antall – fjernes fortløpende når de blir utsolgt.";

export const ombyggingssalgVisitIntroTitle = "Kom innom oss";

export const ombyggingssalgVisitIntroDescription =
  "Mange av modellene i ombyggingssalget er eller har vært utstilt i showroom. Kom gjerne innom i Bærum for å se peisen før du kjøper – eller bestill online og hent i butikk der det er merket. Alle utstillingsmodeller må hentes.";

export const ombyggingssalgEmptyStateTitle =
  "Ingen produkter i ombyggingssalg akkurat nå";

export const ombyggingssalgEmptyStateDescription =
  "Vi fant ingen produkter i Peisoutlet-kategorien. Ta gjerne kontakt, eller se aktuelle tilbud.";
