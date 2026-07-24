import { buildBrandHref, buildCategoryHref } from "@/lib/routing/live-url-registry";

import type { HubLandingPageContent } from "./types";
import { parseHubFeatureProse } from "./parse-hub-feature-prose";

const IMG = "/images/hub-pages/peisinnsats";

/** Single source for the split feature column: preamble, then `# Title` / body blocks. */
const PEISINNSATS_FEATURE_PROSE = `
Ved valg av peisinnsats bør du vurdere romstørrelse, varmekapasitet og hvordan innsatsen skal passe inn i peismuren.

# Slik velger du riktig peisinnsats
Størrelse og effekt: Velg en peisinnsats med riktig kilowatt-effekt for rommet. Alle modellene i sortimentet har oppgitt effekt, slik at du enkelt kan sammenligne.

Design: Peisinnsatser finnes i tradisjonelle og moderne uttrykk, med ulike glassflater og rammer.

# Fordeler med peisinnsatser
En peisinnsats leder mer av varmen ut i rommet enn en åpen peis, og gir jevnere temperatur. Det kan redusere vedforbruket og forbedre komforten i stuen.

# Montering i eksisterende peis
I mange tilfeller kan en peisinnsats monteres i en eksisterende mursteinspis, noe som forenkler rehabilitering uten full ombygging.

# Typer peisinnsatser
Vi fører vedfyrte og gassdrevne modeller fra ledende merker. Ta kontakt om du er usikker på hvilken type som passer pipa og rommet ditt.
`.trim();

export const peisinnsatsHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Peisinnsats – effektiv varme og montering i peis",
    description:
      "Hos Peisbutikken finner du peisinnsatser fra Nordpeis, Spartherm og Dovre. Effektiv varme, montering i eksisterende peis og hjelp til å velge riktig modell for stuen.",
  },
  hero: {
    title: "Peisinnsats",
    subtitle: "Effektiv varme og moderne uttrykk i peismuren",
    description:
      "En peisinnsats gir mer varme ut i rommet enn en tradisjonell åpen peis, og kan ofte monteres i eksisterende mursteinspis. Hos oss finner du modeller til både klassiske og moderne interiører.",
    ctaLabel: "Våre peisinnsatser",
    ctaHref: buildCategoryHref("peisinnsats"),
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Spartherm Premium A U 50H peisinnsats blogg bilde – høy moderne hvit hjørnepeis med koselige flammer i lys åpen stue hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge en peisinnsats?",
    paragraphs: [
      "En peisinnsats varmer rommet mer effektivt enn en tradisjonell åpen peis. Den leder varmen ut i stuen i stedet for å la mye av den forsvinne opp gjennom pipa, noe som gir jevnere temperatur og kan redusere vedforbruket.",
      "Peisinnsatser kan ofte monteres i en eksisterende mursteinspis, noe som gjør dem ideelle ved rehabilitering av eldre peiser uten full ombygging. Det sparer både tid og kostnader sammenlignet med å rive og bygge nytt.",
      "Peisinnsatser finnes som vedfyrte og gassdrevne modeller, i ulike størrelser og design. Hos Peisbutikken fører vi kvalitetsmerker som Nordpeis, Spartherm og Dovre, slik at du finner en løsning som passer pipa, rommet og stilen din.",
    ],
  },
  brandTeaserIntro: {
    title: "Peisinnsatser fra ledende merker",
    description:
      "Hos Peisbutikken fører vi peisinnsatser fra anerkjente produsenter. Utforsk merkene våre og finn modellen som passer pipa og stuen din:",
  },
  brandTeasers: [
    {
      id: "nordpeis",
      title: "Nordpeis",
      description:
        "Nordpeis tilbyr et bredt spekter av moderne og stilige peisinnsatser. De er enkle å installere og gir et rent, moderne uttrykk som passer perfekt i nyere boliger. Trykk på knappen under for å se våre peisinnsatser fra Nordpeis.",
      ctaLabel: "Nordpeis",
      href: buildBrandHref("nordpeis"),
      imageSrc: `${IMG}/brand-nordpeis.webp`,
      imageAlt:
        "Nordpeis-logo med rødt flamme-symbol og navnet «Nordpeis», som representerer høykvalitets peiser.",
    },
    {
      id: "spartherm",
      title: "Spartherm",
      description:
        "Spartherm er kjent for tyske premium peisinnsatser med stort glassareal, høy virkningsgrad og gjennomført design. Her finner du modeller som gir både god varmeøkonomi og et tydelig arkitektonisk uttrykk i stuen. Utforsk Spartherm-sortimentet hos oss.",
      ctaLabel: "Spartherm",
      href: buildBrandHref("spartherm"),
      imageSrc: `${IMG}/brand-spartherm.webp`,
      imageAlt:
        "Spartherm-logo – varemerke i fet svart typografi for premium tyske peisinnsatser hos Peisbutikken.no",
    },
    {
      id: "dovre",
      title: "Dovre",
      description:
        "Dovre fokuserer på robusthet og effektivitet, og deres peisinnsatser er laget for å tåle harde norske vintre samtidig som de gir en jevn og behagelig varme. Trykk på knappen under for å se våre Dovre peisinnsatser.",
      ctaLabel: "Dovre",
      href: buildBrandHref("dovre"),
      imageSrc: `${IMG}/brand-dovre.webp`,
      imageAlt:
        "Dovre Peis-logo med oval ramme, merkenavnet «Dovre» og rødt flamme-symbol.",
    },
  ],
  feature: {
    ...parseHubFeatureProse(PEISINNSATS_FEATURE_PROSE),
    imageSrc: `${IMG}/feature-dovre-2575.webp`,
    imageAlt:
      "Dovre 2575 peisinnsats med 3-sidet glass livsstilsbilde – moderne hjørne vedpeisinnsats med panoramisk flammebilde i lys stue hos Peisbutikken.no",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss/",
  },
};
