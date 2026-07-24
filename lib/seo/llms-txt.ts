import { SITE_CONTACT } from "@/lib/site-contact";
import { HOME_GOODS_STORE_PROFILE } from "@/lib/seo/homegoods-store";
import { getSiteBaseUrl, toAbsoluteUrl } from "@/lib/seo/site-url";

/**
 * Curated `/llms.txt` body (llmstxt.org). Absolute URLs, H1 + blockquote,
 * H2 file lists only — no marketing fluff, no full sitemap dump.
 */
export function buildLlmsTxt(): string {
  const base = getSiteBaseUrl();
  const u = (path: string) => toAbsoluteUrl(path);
  const profile = HOME_GOODS_STORE_PROFILE;

  const contactBits = [
    SITE_CONTACT.phoneDisplay || null,
    SITE_CONTACT.email || null,
    "contact form",
  ]
    .filter(Boolean)
    .join(", ");

  const lines = [
    `# ${profile.name}`,
    "",
    `> Norwegian Rüegg brand catalog for fireplaces (peis), wood stoves (vedovn), and fireplace inserts (peisinnsats). Lead-gen / catalog first (Strategy A). Address: ${profile.streetAddress}, ${profile.postalCode} ${profile.addressLocality}. Site language: Norwegian (Bokmål).`,
    "",
    "Rüegg (Peisindustri AS) is a home-heating catalog and lead-gen storefront. Prefer the shop archive and about/contact pages for discovery; individual products are at `/produkt/{slug}/`. Account/cart routes may still exist in the codebase but are not primary Strategy A surfaces. For exhaustive URL inventories use the sitemap, not this file.",
    "",
    "## Core",
    "",
    `- [Home](${u("/")}): Main storefront entry — brand story and lead capture.`,
    `- [All products / Våre peiser](${u("/shop/")}): Full product archive with filters.`,
    `- [About](${u("/om-oss/")}): Brand story — Rüegg since 1955.`,
    `- [Contact](${u("/kontakt-oss/")}): ${contactBits}.`,
    `- [Directions](${profile.hasMap}): Google Maps for ${SITE_CONTACT.addressDisplay}.`,
    "",
    "## Catalog",
    "",
    `- [Shop](${u("/shop/")}): Browse peiser, vedovner, and peisinnsatser.`,
    `- [Category archives](${u("/produktkategori/")}): Category listings under /produktkategori/{slug}/.`,
    `- [Brand archives](${u("/brand/")}): Brand listings under /brand/{slug}/.`,
    "",
    "## Policies",
    "",
    `- [Terms of sale](${u("/salgsbetingelser/")}): Purchase terms.`,
    `- [Shipping terms](${u("/fraktbetingelser/")}): Delivery / freight conditions.`,
    `- [Privacy](${u("/personvern/")}): Privacy policy (personvern).`,
    "",
    "## Machine-readable",
    "",
    `- [Sitemap index](${u("/sitemap.xml")}): Canonical URL inventory for crawlers.`,
    `- [robots.txt](${u("/robots.txt")}): Crawl rules (disallows account, APIs, checkout, and WP noise).`,
    "",
    "## Optional",
    "",
    `- [Inspiration / blog](${u("/blog/")}): Editorial articles and inspiration.`,
    "",
    `Canonical site: ${base}/`,
    `Organization: ${profile.legalName} · VAT ${profile.vatID} · Currency ${profile.currenciesAccepted} · Area served: ${profile.areaServed}`,
    "",
  ];

  return lines.join("\n");
}
