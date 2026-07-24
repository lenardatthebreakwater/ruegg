import type { FAQItem } from "@/lib/data/homepage";
import {
  monteringPageData,
  type ServicePageData,
  type ServiceTrustItem,
} from "@/lib/data/service-pages";
import type { WpPostNode } from "@/lib/graphql/types";
import {
  cleanupText,
  parseLocalMonteringContent,
} from "@/lib/content-mapping/local-montering-parser-rules";
import {
  getBlogHeading,
  getBlogImage,
  getBlogParagraph,
  getJetGalleryItems,
  getPostContentSections,
} from "@/lib/content-mapping/local-montering-custom-field-extractors";

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("nb-NO") + word.slice(1))
    .join(" ");
}

function extractPlaceFromSlug(slug: string): string {
  const normalized = slug
    .replace(/^peismontering-(i|pa)-/i, "")
    .replace(/-/g, " ")
    .trim();
  return normalized.length > 0 ? toTitleCase(normalized) : "ditt område";
}

function extractPlaceFromTitle(title: string | null | undefined, slug: string): string {
  const normalizedTitle = cleanupText(title ?? "");
  const match = normalizedTitle.match(/peismontering\s+i\s+(.+)$/i);
  if (match?.[1]) return match[1].trim();
  return extractPlaceFromSlug(slug);
}

function buildTrustItems(place: string): ServiceTrustItem[] {
  return [
    { iconKey: "shieldCheck", text: "Montering etter lover og forskrifter" },
    { iconKey: "wrench", text: "Sertifiserte fagfolk med lang erfaring" },
    { iconKey: "mapPin", text: `Lokal peismontering i ${place} og nærområdet` },
  ];
}

function buildFaqItems(parsedItems: FAQItem[]): FAQItem[] {
  if (parsedItems.length >= 4) {
    return parsedItems.slice(0, 10).map((item, index) => ({
      ...item,
      id: `lokal-montering-faq-${index + 1}`,
    }));
  }

  return monteringPageData.faqItems.map((item, index) => ({
    ...item,
    id: `lokal-montering-fallback-faq-${index + 1}`,
  }));
}

function getFeaturedImage(post: WpPostNode) {
  return post.featuredImage?.node?.sourceUrl || monteringPageData.hero.imageUrl;
}

function getFeaturedImageAlt(post: WpPostNode, place: string) {
  const fromPost = post.featuredImage?.node?.altText?.trim();
  if (fromPost) return fromPost;
  return `Peismontering i ${place}`;
}

export function buildLokalmonteringPublicPath(slug: string): string {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  if (/^peismontering-(i|pa)-/i.test(normalized)) {
    return `/${normalized}/`;
  }

  const withLegacyPrefix = `peismontering-i-${normalized
    .replace(/^lokalmontering-?/i, "")
    .replace(/^-+/, "")}`;

  return `/${withLegacyPrefix}/`;
}

export function mapLocalMonteringPostToServicePageData(post: WpPostNode): ServicePageData {
  const slug = post.slug;
  const place = extractPlaceFromTitle(post.title, slug);
  const parsed = parseLocalMonteringContent(post.content ?? "");
  const excerpt = cleanupText(post.excerpt ?? "");
  const intro =
    (parsed.introText ?? excerpt) || monteringPageData.hero.description;

  const areas = parsed.areas.length >= 3
    ? parsed.areas
    : [place, ...monteringPageData.mapContent.areas.filter((area) => area !== place)].slice(0, 10);

  const areaDescription =
    parsed.areaDescription ??
    parsed.offerText ??
    `Vi tilbyr peismontering i ${place} og områdene rundt, vanligvis innen omtrent én time fra butikken vår i Bærum.`;

  const faqItems = buildFaqItems(parsed.faqItems);
  const priceOrGasContext = [parsed.pricesText, parsed.gasText]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  const heroHeadingFromPost = getBlogHeading(post, 1);
  const heroParagraphFromPost = getBlogParagraph(post, 1);
  const heroImageFromPost = getBlogImage(post, 1);
  const galleryHeadingFromPost = getBlogHeading(post, 5);
  const galleryParagraphFromPost = getBlogParagraph(post, 5);
  const galleryItemsFromPost = getJetGalleryItems(post, place);
  const postContentSections = getPostContentSections(post);

  const galleryItems = galleryItemsFromPost.length > 0
    ? galleryItemsFromPost
    : monteringPageData.galleryItems.map((item, index) => ({
      ...item,
      id: `lokal-montering-${index + 1}`,
      caption:
        item.caption != null
          ? `${item.caption} - eksempel fra oppdrag i og rundt ${place}`
          : `Eksempel på peismontering i og rundt ${place}`,
    }));

  return {
    slug: "montering",
    hero: {
      eyebrow: `Trygg peismontering i ${place}`,
      title: heroHeadingFromPost ?? `Peismontering i ${place} - sikkert, ryddig og forskriftsmessig`,
      description: heroParagraphFromPost ?? (priceOrGasContext ? `${intro} ${priceOrGasContext}` : intro),
      callCtaLabel: "Kontakt oss for tilbud",
      callCtaHref: "#kontakt",
      imageUrl: heroImageFromPost?.imageUrl ?? getFeaturedImage(post),
      imageAlt: heroImageFromPost?.altText ?? getFeaturedImageAlt(post, place),
    },
    trustItems: buildTrustItems(place),
    mapContent: {
      title: `Hvor vi monterer i ${place} og omegn`,
      description: areaDescription,
      areasHeading: `Områder hvor vi ofte monterer peis i nærheten av ${place}:`,
      areas,
      closingText:
        "Usikker på om vi monterer hos deg? Send oss en forespørsel, så avklarer vi raskt.",
    },
    location: monteringPageData.location,
    galleryTitle: galleryHeadingFromPost ?? `Eksempler på peismontering i og rundt ${place}`,
    galleryDescription: galleryParagraphFromPost ??
      "Se eksempler på installasjoner vi har levert med fokus på trygghet, funksjon og et pent sluttresultat.",
    galleryItems,
    postContentSections: postContentSections.length > 0 ? postContentSections : undefined,
    faqTitle: `Ofte stilte spørsmål om peismontering i ${place}`,
    faqDescription:
      "Her finner du svar på spørsmål kunder i området ofte stiller før montering.",
    faqItems,
  };
}

export function buildLokalmonteringMeta(post: WpPostNode): {
  title: string;
  description: string;
  place: string;
} {
  const place = extractPlaceFromTitle(post.title, post.slug);
  const parsed = parseLocalMonteringContent(post.content ?? "");
  const excerpt = cleanupText(post.excerpt ?? "");
  const heroParagraphFromPost = getBlogParagraph(post, 1);
  const description = heroParagraphFromPost ?? ((parsed.introText ?? excerpt) ||
    `Peismontering i ${place} utført av erfarne fagfolk. Få et uforpliktende tilbud fra Peisbutikken.`);

  return {
    title: `Peismontering i ${place}`,
    description,
    place,
  };
}
