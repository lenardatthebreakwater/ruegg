/**
 * Homepage four-up marketing strips (image + copy + CTA). Copy is Norwegian; identifiers in English.
 *
 * Image sources (Tinify AVIF+WebP under public/images/homepage/):
 * - feature-strip-seasonal-outdoor-fireplace (utepeis på terrasse ved skumring)
 * - feature-strip-wood-stove-wide (Contura peisovn i stue ved skumring)
 * - feature-strip-installation (montør under peismontering)
 * - feature-strip-3d-visualization (3D-visualisering av peis i hjem)
 */

export type HomeFeatureStrip = {
  id: string;
  title: string;
  subtitle?: string;
  /** Blank-line–separated paragraphs rendered as <p> blocks. */
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
  /** Optional full-bleed section backdrop; defaults to `imageSrc`. */
  sectionBackgroundImageSrc?: string;
  /** Image column on large screens: left = image in first column. */
  imageSide: "left" | "right";
};

export const homeFeatureStrips: HomeFeatureStrip[] = [
  {
    id: "sesongstilbud",
    title: "Sesongens tilbud",
    description: `Her har vi samlet alle våre nåværende tilbud. Se våre tilbud og bli inspirert!`,
    ctaLabel: "Se våre tilbud",
    ctaHref: "/shop/",
    imageSrc: "/images/homepage/feature-strip-seasonal-outdoor-fireplace.webp",
    imageAlt:
      "Par som griller på utepeis på terrassen en sommerkveld med lyslenker og grøntområde",
    imageSide: "right",
  },
  {
    id: "peis-og-vedovner",
    title: "Våre peis og vedovner",
    description: `Vi har mange koselige og flotte peisovner som passer til alle typer hjem og hytter.`,
    ctaLabel: "Se peisovner",
    ctaHref: "/shop/",
    imageSrc: "/images/homepage/feature-strip-wood-stove-wide.webp",
    imageAlt:
      "Contura peisovn med levende flammer i moderne stue ved skumring",
    imageSide: "left",
  },
  {
    id: "peismontering",
    title: "Peismontering",
    subtitle:
      "Vurderer du å tilføre varme og sjarm til hjemmet ditt med en peis eller ovn?",
    description: `Enten du er tiltrukket av den tradisjonelle appellen til en vedfyrt ovn, den stilige bekvemmeligheten til en gasspeis, eller effektiviteten til en peisinnsats eller fireplace insert, involverer det å gjøre det riktige valget mer enn bare estetikk.

Denne artikkelen dekker det essensielle—hva hver mulighet innebærer, viktige faktorer å vurdere før kjøp, og installasjonsprosessene som er involvert. Fra sikkerhetsforskrifter til budsjettvurderinger, finn alt du trenger å vite.`,
    ctaLabel: "Les mer om montering",
    ctaHref: "/kontakt-oss/",
    imageSrc: "/images/homepage/feature-strip-installation.webp",
    imageAlt:
      "Smilende fagperson med armer i kryss foran peis under montering i bolig",
    imageSide: "right",
  },
  {
    id: "3d-skisser",
    title: "Lurer du på hvordan du kan visualisere ditt peisprosjekt?",
    subtitle: "Vi tilbyr 3D-skisser før installasjonsprosessen",
    description: `Uten ekstra kostnad, kan vi tilby 3D-skisser på forhånd hvis nødvendig for å hjelpe våre kunder med å visualisere plasseringen og designet av deres valgte peis eller ovn.

Dette gjør det mulig å gjøre eventuelle nødvendige justeringer før den faktiske installasjonsprosessen begynner. Prosessen inkluderer også sikring av at oppvarmingsapparatet er plassert på en forsvarlig måte.

Dette er en flott måte å få et inntrykk av hvordan hjemmet ditt blir med en ny peis eller vedovn fra Rüegg.`,
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss/",
    imageSrc: "/images/homepage/feature-strip-3d-visualization.webp",
    imageAlt:
      "3D-rendering av et moderne ildsted i et åpent hjemmemiljø med kjøkken og spiseplass",
    imageSide: "left",
  },
];

export function homeFeatureDescriptionToParagraphs(
  description: string
): string[] {
  return description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
