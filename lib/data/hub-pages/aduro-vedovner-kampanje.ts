import type { HubHomeHeroContent, HubProseBlock, HubSeo } from "./types";

const IMG = "/images/campaigns/aduro-vedovner";

export const ADURO_VEDOVNER_KAMPANJE_PATH =
  "/eklsusive-kampanjetilbud-pa-aduro-vedovner/" as const;

export const aduroVedovnerKampanjeSeo: HubSeo = {
  title: "Aduro vedovner – eksklusive kampanjetilbud",
  description:
    "Kampanje på Aduro vedovner hos Peisbutikken. Dansk design, effektiv forbrenning og Aduro Tronic. Se tilbudene og få råd i showroom i Bærum.",
};

export const aduroVedovnerKampanjeHero: HubHomeHeroContent = {
  eyebrow: "Kampanje",
  title: "Utforsk våre eksklusive kampanjetilbud på Aduro vedovner",
  description: [
    "Velkommen til vår spesialside dedikert til unike kampanjetilbud på seks forskjellige Aduro vedovner.",
    "Enten du er på jakt etter en stilren peisovn, en effektiv vedovn, eller en kombinasjon av begge, har vi noe for deg.",
  ],
  ctaLabel: "Kontakt oss",
  ctaHref: "/kontakt-oss/",
  imageSrc: `${IMG}/hero.webp`,
  imageAlt:
    "Aduro 9.3 Lux peisovn montering – høy sort sylindrisk vedovn med panoramiske flammer i moderne hjem hos Peisbutikken.no",
};

export const aduroVedovnerKampanjeDesign: HubProseBlock = {
  title: "Aduro Peisovner: Dansk design og innovasjon",
  paragraphs: [
    "Aduro peisovner er kjent for sitt stilrene danske design og avanserte teknologi. Med fokus på brukervennlighet og miljøvennlighet, tilbyr Aduro en rekke peisovner som passer til enhver smak og behov. Her er noen av fordelene med å velge en Aduro peisovn:",
  ],
  bulletItems: [
    "Stilrent design: Aduro peisovner er designet i samarbeid med anerkjente danske designere, noe som sikrer et elegant og moderne utseende.",
    "Effektiv forbrenning: Med Aduro-tronic automatikk får du en mer effektiv forbrenning og lavere vedforbruk.",
    "Miljøvennlig: Aduro peisovner er utviklet med fokus på å redusere utslipp og sikre renest mulig forbrenning.",
  ],
};

/** YouTube embed on the campaign page (same as WordPress). */
export const aduroVedovnerKampanjeYoutubeVideoId = "e70D4nK4UGA";

export const aduroVedovnerKampanjeYoutubeTitle = "Effektiv forbrenning med Aduro Tronic";
