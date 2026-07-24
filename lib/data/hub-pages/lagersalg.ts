import type { HubHomeHeroContent, HubSeo } from "./types";

/** WooCommerce product category slug (child of Visning) for this landing page. */
export const LAGERSALG_CATEGORY_SLUG = "lagersalg";

export const LAGERSALG_PAGE_PATH = "/lagersalg/" as const;

export const lagersalgSeo: HubSeo = {
  title: "Lagersalg – peisovn og vedovn til redusert pris",
  description:
    "Lagersalg på peisovn og vedovn til redusert pris. Utvalgte modeller – ofte Nordpeis og Dovre – med 30–42 % rabatt. Begrenset lager, kun så langt det rekker.",
};

export const lagersalgHero: HubHomeHeroContent = {
  title: "Lagersalg",
  subtitle: "Utvalgte Nordpeis- og Dovre-modeller til sterke priser",
  description:
    "Lagersalg på utvalgte modeller. Mye å spare på peisovn og vedovn – ofte 30–42 %. Tilbudet gjelder kun så langt lageret rekker, og modeller kan fjernes fortløpende når de blir utsolgt.",
  eyebrow: "Tilbud",
  ctaLabel: "Kontakt oss",
  ctaHref: "#kontakt",
  imageSrc: "/images/hub-pages/lagersalg/hero.webp",
  imageAlt: "Lagersalg på peisovn og vedovn hos Peisbutikken.no",
};

export const lagersalgCarouselTitle = "Utvalgte lagersalgmodeller";

export const lagersalgCarouselDescription =
  "OBS: Begrenset, kun så langt lageret rekker. Modeller fjernes fortløpende når det blir utsolgt.";

export const lagersalgVisitIntroTitle = "Kom innom oss";

export const lagersalgVisitIntroDescription =
  "Hos oss finner du et stort utvalg av peisovner, vedovner og andre produkter til peis, ovn og pipe. Velg mellom alt fra en liten klassisk ovn til en moderne peisinnsats. En peis er ikke bare en praktisk kilde til oppvarming av boligen, det er også en viktig del av interiøret. I tillegg er det et sted hvor man skaper gode og hyggelige opplevelser sammen med familien.";

export const lagersalgEmptyStateTitle = "Ingen lagersalgprodukter akkurat nå";

export const lagersalgEmptyStateDescription =
  "Vi fant ingen produkter i lagersalg-kategorien. Ta gjerne kontakt, eller se aktuelle tilbud.";
