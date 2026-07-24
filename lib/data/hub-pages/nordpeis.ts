import {
  buildCategoryBrandHref,
  buildCategoryHref,
  buildBrandHref,
} from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/nordpeis";

const NORDPEIS_FEATURE_PROSE = `
Nordpeis kombinerer nordisk design, effektiv vedfyring og levende flamme som skaper hygge. Usikker på hva som passer? Start med romstørrelse og om du prioriterer uttrykk eller kompakt varme.

# Peisovn eller vedovn?

Peisovner er ofte større og har flamme synlig gjennom et stort glassvindu. De gir en tradisjonell peisopplevelse og fungerer godt som samlingspunkt i stuen. Peisovner krever pipe og er enklere å installere enn tradisjonelle peiser, men tar gjerne mer plass i rommet.

Vedovner er mer kompakte og har ofte lite eller intet glassvindu. De er laget for effektiv oppvarming og bruker mindre ved takket være avansert forbrenningsteknologi. Også vedovner krever pipe og er enklere å montere enn full peis bygget på stedet.

# Velg riktig Nordpeis-modell

Tenk på romstørrelse, anbefalt effekt og om ovnen skal stå fritt, i hjørne eller bygges inn. Nordpeis dekker peisovn og vedovn, peisinnsats, varmelagrende elementpeis og utepeis.

# Veiledning hos Peisbutikken

Hos Peisbutikken finner du hele Nordpeis-sortimentet og får hjelp til valg, pipe og montering – i nettbutikken eller showroom i Bærum.
`.trim();

export const nordpeisHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Nordpeis peiser og ovner – stort utvalg og god veiledning",
    description:
      "Utforsk Nordpeis peiser og ovner hos Peisbutikken. Peisovn, peisinnsats, utepeis og elementpeis – vi hjelper deg finne riktig modell og montering.",
  },
  hero: {
    title: "Nordpeis peiser",
    subtitle: "Nordisk design og effektiv varme til norske hjem",
    description:
      "Nordpeis leverer peisovner, vedovner, peisinnsatser og elementpeiser med høy virkningsgrad og tidløst uttrykk. Hos Peisbutikken finner du hele sortimentet og får hjelp til valg og montering.",
    ctaLabel: "Hopp ut til produktene  ",
    ctaHref: buildBrandHref("nordpeis"),
    imageSrc: `${IMG}/teaser-peisinnsats.webp`,
    imageAlt:
      "Nordpeis N-29A peisovn vinklet innsats med sort stålramme, Thermotte sidepaneler og levende vedfyr flammer synlige gjennom store glassdører, som viser effektiv peis oppvarmingsdesign.",
  },
  whyChoose: {
    title: "Hvorfor velge Nordpeis?",
    paragraphs: [
      "Nordpeis er et av Norges mest etablerte peismerker, kjent for nordisk design, høy kvalitet og effektiv vedfyring. Sortimentet spenner fra peisovn og vedovn til peisinnsats, varmelagrende elementpeis og utepeis – med løsninger til stue, hytte og uteplass.",
      "Mange Nordpeis-modeller har avansert forbrenningsteknologi som gir høy virkningsgrad og renere forbrenning. Det betyr mer varme per kubbe og lavere vedforbruk over tid, uten at du må gå på kompromiss med flamme og atmosfære.",
      "Hos Peisbutikken finner du hele Nordpeis-sortimentet og får veiledning på modell, effekt, pipe og montering. Besøk showroom i Bærum eller utforsk utvalget online – vi hjelper deg finne riktig peis til ditt hjem.",
    ],
  },
  brandTeaserIntro: {
    title: "Utforsk Nordpeis-kategorier",
    description:
      "Nordpeis dekker flere produkttyper – fra frittstående peisovn til innsats og utepeis. Velg kategori for å se utvalget hos Peisbutikken:",
  },
  brandTeasers: [
    {
      id: "peisovn-vedovn",
      title: "Peisovn og vedovn",
      description:
        "Se Nordpeis peisovner og vedovner tilpasset norske hjem – effektiv varme og tidløst design.",
      ctaLabel: "Peisovn og vedovn",
      href: buildCategoryBrandHref("peisovn", "nordpeis"),
      imageSrc: `${IMG}/teaser-peisovn.webp`,
      imageAlt:
        "Nordpeis Duo 4 Peisovn bilde – høy moderne sort hjørne vedovn med koselige flammer og stort buet glass i lys interiør hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "peisinnsats",
      title: "Peisinnsats",
      description:
        "Peisinnsatser fra Nordpeis gir fleksible løsninger for innbygging og rehabilitering.",
      ctaLabel: "Peisinnsats",
      href: buildCategoryBrandHref("peisinnsats", "nordpeis"),
      imageSrc: `${IMG}/teaser-peisinnsats.webp`,
      imageAlt:
        "Nordpeis N-29A peisovn vinklet innsats med sort stålramme, Thermotte sidepaneler og levende vedfyr flammer synlige gjennom store glassdører, som viser effektiv peis oppvarmingsdesign.",
      imageObjectFit: "cover",
    },
    {
      id: "utepeis",
      title: "Utepeis",
      description:
        "Nordpeis utepeiser for lange kvelder ute – fra kompakte modeller til større løsninger.",
      ctaLabel: "Utepeis",
      href: buildCategoryBrandHref("utepeis", "nordpeis"),
      imageSrc: `${IMG}/teaser-utepeis.webp`,
      imageAlt:
        "Nordpeis Roma Garden utepeis i hvit med flammer, vedoppbevaring og rustfri stålpipe – moderne hagepeis hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "elementpeis",
      title: "Varmelagrende peis – Elementpeis",
      description:
        "Elementpeiser med varmelagring gir behagelig varme lenge etter at ilden er slukket.",
      ctaLabel: "Elementpeis",
      href: buildCategoryBrandHref("elementpeis", "nordpeis"),
      imageSrc: `${IMG}/teaser-elementpeis.webp`,
      imageAlt: "Nordpeis Salzburg C Convection Venstre Elementpeis Image",
      imageObjectFit: "cover",
    },
    {
      id: "stalpipe",
      title: "Stålpipe",
      description:
        "Komplett stålpipe og skorsteinsløsninger som passer til Nordpeis og øvrig sortiment.",
      ctaLabel: "Stålpipe",
      href: buildCategoryHref("pipe"),
      imageSrc: `${IMG}/teaser-stalpipe.webp`,
      imageAlt: "",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(NORDPEIS_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Nordpeis Duo 4 Peisovn bilde – høy moderne sort hjørne vedovn med koselige flammer og stort buet glass i lys interiør hos Peisbutikken.no",
    ctaLabel: "Hopp ut til produktene  ",
    ctaHref: buildBrandHref("nordpeis"),
  },
};
