import type { FAQItem } from "@/lib/data/homepage";

import type { HubFeatureSplitContent, HubHomeHeroContent, HubSeo } from "./types";

const IMG = "/images/campaigns/usedom-5";

export const USEDOM_5_KAMPANJE_PATH = "/usedom-5-kampanje-med-montering/" as const;

export const usedom5KampanjeSeo: HubSeo = {
  title: "Usedom 5 inkludert montering – introduksjonstilbud",
  description:
    "Introduksjonstilbud på Justus Usedom 5 med montering. Oktagon-form, vedlagring og 5,5 kW – for små og mellomstore hjem. Showroom i Bærum.",
};

export const usedom5KampanjeHero: HubHomeHeroContent = {
  eyebrow: "Kampanje",
  title: "Usedom 5 inkludert montering",
  description: [
    "Gjør hjemmet ditt varmt og koselig med vårt introduksjonstilbud på Justus Usedom 5!",
    "Unik og stilig oktagon-form med praktisk vedlagring i bunn. 5,5 kW nominell effekt, så den egner seg godt for små og mellomstore hjem og hytter.",
    "Prisen er inkludert montering inntil 1 times kjøretur fra vår butikk i Bærum til deg.",
  ],
  ctaLabel: "Kontakt oss",
  ctaHref: "#kontakt",
  imageSrc: `${IMG}/hero.webp`,
  imageAlt:
    "Justus Usedom 5 peisovn i sort stål med oktagon-form og vedlagring – kampanje hos Peisbutikken",
};

export const usedom5KampanjeFeature: HubFeatureSplitContent = {
  sections: [
    {
      title: "Justus Usedom 5",
      description:
        "En elegant og moderne peisovn designet for å passe inn i de fleste hjem. Denne peisen fra Justus er det siste tilskuddet i vårt sortiment.",
    },
    {
      title: "Høydepunkter:",
      listItems: [
        "Annerkjent tysk produsent!",
        "Unikt og stilig design",
        "Praktiske løsninger som integrert vedoppbevaring og enkel betjening.",
        "Mulighet for friskluft, så godt egnet også for nyere hjem eller hvis du har balansert ventilasjon",
      ],
      description:
        "Benytt muligheten nå til å få en stilig og moderne peis før vinteren kommer – ferdig montert av erfarne fagfolk!",
    },
  ],
  imageSrc: `${IMG}/feature.webp`,
  imageAlt:
    "Justus Usedom 5 peisovn i sort stål med flammer – produktbilde fra Peisbutikken",
  ctaLabel: "Kontakt oss",
  ctaHref: "/kontakt-oss/",
};

export const usedom5KampanjeFaq: FAQItem[] = [
  {
    id: "etter-bestilling",
    question: "Hva skjer etter at jeg har bestilt?",
    answer:
      "Etter at bestillingen/betalingen er registrert på nett, så vil vi ta kontakt med deg for å avtale neste steg videre.",
  },
  {
    id: "nar-kommer-dere",
    question: "Når kommer dere?",
    answer:
      "Etter at bestillingen er gjort på nett, så vil vi ta kontakt med deg for å avtale dag og tid for montering. Vi tar med peisen når vi kommer for å montere.",
  },
  {
    id: "ingen-pipe",
    question: "Jeg har ikke pipe fra før, kan jeg bruke tilbudet?",
    answer:
      "Ja, det kan du! Men dersom du ikke har pipe, vil kostnaden for dette komme i tillegg til monteringsprisen.",
  },
  {
    id: "hva-er-inkludert",
    question: "Hva er inkludert?",
    answer:
      "Selve peisen, monteringsmateriell som røykrør. Trenger du nytt uttak i pipen din, så lager vi det.",
  },
  {
    id: "hvor-monterer-dere",
    question: "Hvor monterer dere?",
    answer:
      "Vi har erfarne montører og monterer i Oslo- og Akershus-området. Ta kontakt dersom du vil avklare om adressen din ligger innenfor sonen for dette tilbudet.",
  },
];
