import type { Metadata } from "next";

import { aduroHubLandingContent } from "@/lib/data/hub-pages/aduro";
import { dovrePeisHubLandingContent } from "@/lib/data/hub-pages/dovre-peis";
import { element4HubLandingContent } from "@/lib/data/hub-pages/element4";
import { hajdukHubLandingContent } from "@/lib/data/hub-pages/hajduk";
import { nordpeisHubLandingContent } from "@/lib/data/hub-pages/nordpeis";
import { peisHubLandingContent } from "@/lib/data/hub-pages/peis";
import { peisinnsatsHubLandingContent } from "@/lib/data/hub-pages/peisinnsats";
import { peisovnHubLandingContent } from "@/lib/data/hub-pages/peisovn";
import { stalpipeHubLandingContent } from "@/lib/data/hub-pages/stalpipe";
import { utepeisHubLandingContent } from "@/lib/data/hub-pages/utepeis";
import { vedovnHubLandingContent } from "@/lib/data/hub-pages/vedovn";
import { buildPageMetadata } from "@/lib/seo/metadata";

import type { PopulaereSokHub, PopulaereSokHubId } from "./types";

const IMG = "/images/populaere-sok";

export const POPULAERE_SOK_HUBS: PopulaereSokHub[] = [
  {
    id: "peis",
    path: "/peis/",
    menuTitle:
      "Peis – Utforsk våre peiser og finn den perfekte peisen for ditt hjem",
    breadcrumbLabel: "Peis",
    metaTitle: peisHubLandingContent.seo.title,
    metaDescription: peisHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/peis.webp`,
    menuImageAlt:
      "Peisovn bilde – moderne sort frittstående vedovn med koselige flammer i lys samtid stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "peisinnsats",
    path: "/peisinnsats/",
    menuTitle: "Peisinnsats – Effektive og moderne peisinnsatser for ditt hjem",
    breadcrumbLabel: "Peisinnsats",
    metaTitle: peisinnsatsHubLandingContent.seo.title,
    metaDescription: peisinnsatsHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/peisinnsats.webp`,
    menuImageAlt:
      "Dovre 2575 CBS peisinnsats livsstilsbilde – moderne dobbeltsidig hjørne vedpeisinnsats med koselige flammer i lys åpen stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "peisovn",
    path: "/peisovn/",
    menuTitle:
      "Peisovn – Finn den perfekte peisovnen for ditt hjem | Peisbutikken",
    breadcrumbLabel: "Peisovn",
    metaTitle: peisovnHubLandingContent.seo.title,
    metaDescription: peisovnHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/peisovn.webp`,
    menuImageAlt:
      "Nordpeis YoU Colorado White livsstilsbilde – høy moderne hvit sylindrisk vedovn med koselige flammer i lys skandinavisk stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "dovre-peis",
    path: "/dovre-peis/",
    menuTitle:
      "Dovre Peis – Utforsk Dovre peiser hos Peisbutikken | Kvalitet og design",
    breadcrumbLabel: "Dovre peis",
    metaTitle: dovrePeisHubLandingContent.seo.title,
    metaDescription: dovrePeisHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/dovre-peis.webp`,
    menuImageAlt:
      "Dovre 40 CBS vedovn i sort støpejern med dekorative detaljer, plassert foran hvite vegger og rustikk murstein, omgitt av lyst tregulv, grått teppe, en lenestol og et vindu med utsikt til snødekte trær",
    ctaLabel: "Les mer",
  },
  {
    id: "utepeis",
    path: "/utepeis/",
    menuTitle:
      "Utepeis – Finn den perfekte utepeisen til ditt uteområde | Peisbutikken",
    breadcrumbLabel: "Utepeis",
    metaTitle: utepeisHubLandingContent.seo.title,
    metaDescription: utepeisHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/utepeis.webp`,
    menuImageAlt:
      "Nordpeis Roma Garden utepeis i hvit med flammer, vedoppbevaring og innsjøutsikt – stilren hagepeis hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "vedovn",
    path: "/vedovn/",
    menuTitle: "Vedovn – Velg den beste vedovnen for ditt hjem",
    breadcrumbLabel: "Vedovn",
    metaTitle: vedovnHubLandingContent.seo.title,
    metaDescription: vedovnHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/vedovn.webp`,
    menuImageAlt:
      "Justus Rustico 90 2.0 sort høyre – klassisk sort komfyr med flammer i koselig kjøkken hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "hajduk",
    path: "/hajduk/",
    menuTitle: "Hajduk Peis – Utforsk Hajduk peiser for ditt hjem",
    breadcrumbLabel: "Hajduk",
    metaTitle: hajdukHubLandingContent.seo.title,
    metaDescription: hajdukHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/hajduk.webp`,
    menuImageAlt:
      "Hajduk produktbilde – moderne høy grå hjørne vedpeisinnsats med koselige flammer i lys åpen stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "element4",
    path: "/element4/",
    menuTitle: "Element4 Peis – Moderne peiser fra Element4",
    breadcrumbLabel: "Element4",
    metaTitle: element4HubLandingContent.seo.title,
    metaDescription: element4HubLandingContent.seo.description,
    menuImageSrc: `${IMG}/element4.webp`,
    menuImageAlt:
      "Element4 Summum 140 gasspeis livsstilsbilde – luksuriøs bred innbygd gasspeis med realistiske flammer i moderne elegant stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "nordpeis",
    path: "/nordpeis/",
    menuTitle: "Nordpeis – Moderne og stilfulle peiser fra Nordpeis",
    breadcrumbLabel: "Nordpeis",
    metaTitle: nordpeisHubLandingContent.seo.title,
    metaDescription: nordpeisHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/nordpeis.webp`,
    menuImageAlt:
      "Nordpeis Wave T 3+3 Wide Elementpeis livsstilsbilde – høy moderne terrakotta ribbet elementpeis med koselige flammer i lys åpen stue/spisestue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "stalpipe",
    path: "/stalpipe/",
    menuTitle: "Stålpipe – Kvalitetssikret stålpipe for trygg oppvarming",
    breadcrumbLabel: "Stålpipe",
    metaTitle: stalpipeHubLandingContent.seo.title,
    metaDescription: stalpipeHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/stalpipe.webp`,
    menuImageAlt:
      "Spartherm Passo XS kompakt sort sylindrisk vedfyrt peisovn med glassfront og flammer i moderne stue hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
  {
    id: "aduro",
    path: "/aduro/",
    menuTitle: "Aduro Peis – Effektiv og moderne oppvarming for norske hjem",
    breadcrumbLabel: "Aduro",
    metaTitle: aduroHubLandingContent.seo.title,
    metaDescription: aduroHubLandingContent.seo.description,
    menuImageSrc: `${IMG}/aduro.webp`,
    menuImageAlt:
      "Aduro 15 Lux Peisovn livsstilsbilde – moderne sort buet vedovn med panoramiske flammer i lys skandinavisk stue med golden retriever og glassplate hos Peisbutikken.no",
    ctaLabel: "Les mer",
  },
];

const HUB_BY_ID: Record<PopulaereSokHubId, PopulaereSokHub> =
  Object.fromEntries(POPULAERE_SOK_HUBS.map((h) => [h.id, h])) as Record<
    PopulaereSokHubId,
    PopulaereSokHub
  >;

const HUB_BY_PATH: Map<string, PopulaereSokHub> = new Map(
  POPULAERE_SOK_HUBS.map((h) => [h.path, h])
);

export function getPopulaereSokHubById(
  id: PopulaereSokHubId
): PopulaereSokHub | undefined {
  return HUB_BY_ID[id];
}

export function getPopulaereSokHubByPath(path: string): PopulaereSokHub | undefined {
  const normalized =
    path.endsWith("/") || path === "" ? path || "/" : `${path}/`;
  return HUB_BY_PATH.get(normalized);
}

export function buildHubPageMetadata(hubId: PopulaereSokHubId): Metadata {
  const hub = HUB_BY_ID[hubId];
  return buildPageMetadata({
    title: hub.metaTitle,
    description: hub.metaDescription,
    path: hub.path,
  });
}
