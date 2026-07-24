import { buildCategoryHref } from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/stalpipe";

const PIPE_STALPIPE = "/produktkategori/pipe/stalpipe/";
const KONTAKT_OSS = "/kontakt-oss/";

const STALPIPE_FEATURE_PROSE = `
Når du skal velge stålpipe, bør du vurdere pipetype, isolering og montering – slik at løsningen blir trygg og varer lenge.

# Slik velger du riktig stålpipe

Tenk på avstand til brennbart materiale, om ovnen trenger tilluft utenfra, og om pipen skal gjennom etasjer eller tak. Riktig dimensjonering og godt trekk gir tryggere fyringsløsning og bedre forbrenning.

# Fordeler med stålpipe

Stålpipe er enkel å montere, krever lite vedlikehold og tåler høye temperaturer over mange år. Med riktig oppsett får du jevnt trekk og effektiv varme fra peisen eller ovnen.

# Ventilert, isolert og universal

Ventilert stålpipe fører friskluft til ovnen utenfra. Isolert pipe beskytter omkringliggende konstruksjoner i trange montasjer. Universal stålpipe passer mange ovner og er fleksibel ved oppgradering.

# Pipesøknad ved pipebytte

Skal du sette opp ny pipe eller bytte gammel pipeløsning, trengs som regel søknad til kommunen. Peisbutikken hjelper deg med riktig løsning og veiledning – ta kontakt.
`.trim();

const categoryPipe = buildCategoryHref("pipe");

export const stalpipeHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Stålpipe – trygg fyringsløsning med montering og kvalitet",
    description:
      "Finn riktig stålpipe hos Peisbutikken. Vi tilbyr kvalitetspiper, veiledning og montering for trygg og effektiv fyringsløsning i hjemmet ditt.",
  },
  hero: {
    title: "Stålpipe",
    subtitle: "Trygg pipeløsning med riktig isolering og montering",
    description:
      "Stålpipe leder røyk og varme trygt fra peis eller ovn. Hos Peisbutikken finner du ventilert, isolert og universal stålpipe – med veiledning til valg og montering.",
    ctaLabel: "Våre Stålpiper",
    ctaHref: categoryPipe,
    imageSrc: `${IMG}/teaser-isolert.webp`,
    imageAlt:
      "Isolert stålpipe – sort isolert pipeløp montert på moderne peisovn for trygg og effektiv oppvarming hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge stålpipe?",
    paragraphs: [
      "En god stålpipe er grunnlaget for trygg fyringsløsning. Riktig dimensjonering, godt trekk og korrekt montering reduserer risiko for røyklekkasje og sørger for effektiv forbrenning i peis eller ovn.",
      "Isolert stålpipe er viktig når pipen går nær treverk, etasjeskillere eller tak. Ventilert pipe er aktuelt når ovnen trenger tilluft utenfra – da føres friskluften trygt gjennom pipeløpet i stedet for fra rommet.",
      "Du trenger ofte ny stålpipe ved pipebytte, oppgradering av peis eller ovn, eller når gammel mursteinspipe ikke lenger oppfyller kravene. Vi hjelper deg å finne riktig type og størrelse for boligen din.",
    ],
  },
  brandTeaserIntro: {
    title: "Ulike typer stålpipe",
    description:
      "Hos Peisbutikken finner du ventilert, isolert og universal stålpipe. Her er de vanligste variantene:",
  },
  brandTeasers: [
    {
      id: "ventilert",
      title: "Stålpipe Ventilert",
      description:
        "En stålpipe med ventilasjon kalles ofte «TL-pipe» eller «DV-pipe», dvs. tilluftspipe eller direkteventilasjonspipe. Med en slik pipe kan ovnen mates med friskluft utenifra gjennom pipen, dersom ovnen har mulighet for dette.",
      ctaLabel: "Se stålpiper",
      href: PIPE_STALPIPE,
      imageSrc: `${IMG}/teaser-ventilert.webp`,
      imageAlt:
        "Spartherm Passo XS kompakt sort sylindrisk vedfyrt peisovn med en avrundet kropp, oppoverbuet skorsteinrør og bred buet glassfront som avslører lyse oransje flammer inni",
      imageObjectFit: "cover",
    },
    {
      id: "isolert",
      title: "Isolert stålpipe",
      description:
        "Disse stålpipene er designet for å gi ekstra sikkerhet ved å forhindre at varmen sprer seg til omkringliggende materialer. De er perfekte for installasjon i trange områder der plass er en utfordring.",
      ctaLabel: "Se stålpiper",
      href: PIPE_STALPIPE,
      imageSrc: `${IMG}/teaser-isolert.webp`,
      imageAlt:
        "Stålpipe isolert blogg bilde – isolert sort pipeløp på moderne sort vedovn i koselig hytte-stil stue med skogsutsikt hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "universal",
      title: "Universal stålpipe",
      description:
        "En allsidig løsning som kan tilpasses en rekke forskjellige ovner og peiser. Universalmodellen er enkel å installere og vedlikeholde.",
      ctaLabel: "Se stålpiper",
      href: PIPE_STALPIPE,
      imageSrc: `${IMG}/teaser-universal.webp`,
      imageAlt:
        "Stålpipe Universal blogg bilde – sort universelt pipeløp montert på moderne sort vedovn i koselig mørk stue med vinmarksutsikt hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(STALPIPE_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Nordpeis Lisboa - Koselig peisbilde i nybygd hjem med elementpeis og stålpipe",
    ctaLabel: "Kontakt oss for en hyggelig pipeprat! ",
    ctaHref: KONTAKT_OSS,
  },
};
