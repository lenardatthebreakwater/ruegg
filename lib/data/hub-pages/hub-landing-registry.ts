import type { PopulaereSokHubId } from "@/lib/populaere-sok/types";

import { aduroHubLandingContent } from "./aduro";
import { dovrePeisHubLandingContent } from "./dovre-peis";
import { element4HubLandingContent } from "./element4";
import { hajdukHubLandingContent } from "./hajduk";
import { nordpeisHubLandingContent } from "./nordpeis";
import { peisHubLandingContent } from "./peis";
import { peisinnsatsHubLandingContent } from "./peisinnsats";
import { peisovnHubLandingContent } from "./peisovn";
import { stalpipeHubLandingContent } from "./stalpipe";
import { utepeisHubLandingContent } from "./utepeis";
import { vedovnHubLandingContent } from "./vedovn";
import type { HubLandingPageContent, HubSeo } from "./types";

/** Hub landings with full content; others use PopulaereSokHubBlankPage until added. */
export const HUB_LANDING_CONTENT_BY_ID: Partial<
  Record<PopulaereSokHubId, HubLandingPageContent>
> = {
  peis: peisHubLandingContent,
  peisinnsats: peisinnsatsHubLandingContent,
  peisovn: peisovnHubLandingContent,
  "dovre-peis": dovrePeisHubLandingContent,
  utepeis: utepeisHubLandingContent,
  vedovn: vedovnHubLandingContent,
  hajduk: hajdukHubLandingContent,
  element4: element4HubLandingContent,
  nordpeis: nordpeisHubLandingContent,
  stalpipe: stalpipeHubLandingContent,
  aduro: aduroHubLandingContent,
};

export function getHubLandingContent(
  id: PopulaereSokHubId
): HubLandingPageContent | undefined {
  return HUB_LANDING_CONTENT_BY_ID[id];
}

export function getHubLandingSeo(id: PopulaereSokHubId): HubSeo | undefined {
  return HUB_LANDING_CONTENT_BY_ID[id]?.seo;
}
