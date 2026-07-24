import type {
  Product,
  ProductAttribute,
  ProductGalleryItem,
  ProductVariation,
} from "@/lib/types/product";
import type { SearchProduct } from "@/lib/types/search-product";
import { parseMetaImageValue } from "@/lib/graphql/parse-meta-image-value";
import { pickProductCardImageUrl } from "@/lib/graphql/pick-product-card-image-url";
import {
  decodeHtmlEntities,
  parseProductDescriptionCards,
} from "@/lib/products/description-cards";
import { resolveEuEnergyLabelBadgeUrlFromLetter } from "@/lib/products/eu-energy-label-badge-url";
import { normalizeStockStatus } from "@/lib/products/stock-status";
import type {
  WooProductNode,
  WooProductMetaData,
  WooProductVariationNode,
  WooVariationAttribute,
} from "./types";

function mapWooTypenameToProductType(
  typename: string | null | undefined
): Product["productType"] {
  switch (typename) {
    case "SimpleProduct":
      return "simple";
    case "VariableProduct":
      return "variable";
    case "ExternalProduct":
      return "external";
    case "GroupProduct":
      return "grouped";
    default:
      return null;
  }
}

function normalizePrice(price: string | null | undefined): {
  formatted: string;
  numeric: number | null;
} {
  if (!price || typeof price !== "string") {
    return { formatted: "", numeric: null };
  }
  const cleaned = price.replace(/\s/g, " ").replace(/&nbsp;/g, " ").trim();
  const numericMatch = cleaned.replace(/\s/g, "").match(/[\d,.]+/);
  const numeric = numericMatch
    ? parseFloat(numericMatch[0].replace(",", "."))
    : null;
  const formatted = cleaned || (numeric != null ? `${numeric} kr` : "");
  return { formatted, numeric: Number.isNaN(numeric) ? null : numeric };
}

function formatSaleBadge(
  regularPrice: string | null | undefined,
  price: string | null | undefined,
  onSale: boolean | null | undefined
): string | null {
  if (!onSale || !regularPrice || !price) return null;
  const { numeric: reg } = normalizePrice(regularPrice);
  const { numeric: curr } = normalizePrice(price);
  if (reg == null || curr == null || reg <= curr) return null;
  const diff = reg - curr;
  return `Spar ${Math.round(diff).toLocaleString("nb-NO")} kr`;
}

function getMetaValue(
  metaData: WooProductMetaData[] | null | undefined,
  key: string
): string | null {
  if (!metaData) return null;
  const entry = metaData.find((m) => m.key === key);
  return entry?.value ?? null;
}

const GTIN_META_KEYS = [
  "_global_unique_id",
  "_wc_gtin",
  "gtin",
  "_rank_math_gtin_code",
  "_woosea_gtin",
  "_woosea_ean",
] as const;

function getGtinFromMeta(
  metaData: WooProductMetaData[] | null | undefined
): string | null {
  for (const key of GTIN_META_KEYS) {
    const v = getMetaValue(metaData, key);
    if (v?.trim()) return v.trim();
  }
  return null;
}

/**
 * WooCommerce stores showroom flag in meta key `utstilt` as JSON, e.g. `{"Utstilt":"true"}`.
 */
function parseDisplayedInStoreFromUtstiltMeta(
  metaData: WooProductMetaData[] | null | undefined
): boolean {
  const raw = getMetaValue(metaData, "utstilt")?.trim();
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && parsed !== null) {
      const rec = parsed as Record<string, unknown>;
      const v = rec.Utstilt ?? rec.utstilt;
      if (v === true) return true;
      if (typeof v === "string") {
        const t = v.trim().toLowerCase();
        return t === "true" || t === "1" || t === "yes";
      }
    }
  } catch {
    // Non-JSON legacy values
  }
  const lower = raw.toLowerCase();
  return lower === "yes" || raw === "1" || lower === "true";
}

/** Parse WooCommerce dimension/weight strings (e.g. "120", "12,5", "0.5") as numbers. */
function parseWooNumber(raw: string | null | undefined): number | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.replace(/\u00a0/g, " ").trim();
  if (!t) return null;
  let n = t;
  if (n.includes(",") && n.includes(".")) {
    n = n.replace(/\./g, "").replace(",", ".");
  } else {
    n = n.replace(",", ".");
  }
  const match = n.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const v = parseFloat(match[0]);
  return Number.isFinite(v) ? v : null;
}

/**
 * Clean attribute option slug to a human-readable value.
 * E.g. "askeskuff-ja" → "Ja", "vekt-95" → "95", "sort" → "Sort"
 */
function cleanAttributeOption(option: string, attrName: string): string {
  const prefixParts = attrName.replace("pa_", "").split("-");
  let cleaned = option;
  for (const part of prefixParts) {
    const prefixRegex = new RegExp(`^${part}-?`, "i");
    cleaned = cleaned.replace(prefixRegex, "");
  }
  cleaned = cleaned.replace(/-/g, " ").trim();
  if (!cleaned) return option.replace(/-/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function getAttributeDisplayValues(attribute: {
  name: string;
  options?: string[] | null;
  terms?: { nodes: Array<{ name: string; slug?: string | null }> } | null;
}): string[] {
  const termNames = (attribute.terms?.nodes ?? [])
    .map((term) => term.name?.trim())
    .filter((name): name is string => Boolean(name));
  if (termNames.length > 0) return termNames;

  return (attribute.options ?? []).map((option) =>
    cleanAttributeOption(option, attribute.name)
  );
}

function parseNumericAttributeValue(rawValue: string): number | null {
  const trimmed = rawValue.trim();
  if (!trimmed) return null;

  const decimalFromSeparatorMatch = trimmed.match(
    /^(\d{1,3})\s*[-,]\s*(\d)(?:\s*(?:kW|kw|kWh|kwh))?$/u
  );
  if (decimalFromSeparatorMatch) {
    const value = Number.parseFloat(
      `${decimalFromSeparatorMatch[1]}.${decimalFromSeparatorMatch[2]}`
    );
    return Number.isFinite(value) ? value : null;
  }

  const decimalFromSpaceMatch = trimmed.match(
    /^(\d{1,3})\s+(\d)(?:\s*(?:kW|kw|kWh|kwh))?$/u
  );
  if (decimalFromSpaceMatch) {
    const value = Number.parseFloat(
      `${decimalFromSpaceMatch[1]}.${decimalFromSpaceMatch[2]}`
    );
    return Number.isFinite(value) ? value : null;
  }

  let normalized = trimmed.replace(/\u00a0/g, " ");
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(",", ".");
  }

  const numericToken = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!numericToken) return null;
  const value = Number.parseFloat(numericToken[0]);
  return Number.isFinite(value) ? value : null;
}

function parseAttributes(node: WooProductNode): ProductAttribute[] | null {
  const attrs = node.attributes?.nodes;
  if (!attrs || attrs.length === 0) return null;

  return attrs
    .filter(
      (a) =>
        a.visible &&
        (Array.isArray(a.options) && a.options.length > 0
          ? true
          : (a.terms?.nodes?.length ?? 0) > 0)
    )
    .map((a) => ({
      name: a.name,
      label: a.label,
      value: getAttributeDisplayValues(a).join(", "),
    }));
}

function extractAttributeTermSlugs(node: WooProductNode): string[] | null {
  const attrs = node.attributes?.nodes ?? [];
  // Prefer `options` for global attributes: WPGraphQL paginates `terms`
  // (default first: 10), so multi-model reservedeler products (60+ terms)
  // would otherwise lose most of their model slugs and disappear from
  // almost every parts archive. `options` already holds the full assigned
  // term-slug list. Merge both so we still pick up any term-only edge cases.
  const slugs = attrs.flatMap((attribute) => {
    const fromOptions = (attribute.options ?? [])
      .map((option) => option?.trim().toLocaleLowerCase("nb-NO") ?? "")
      .filter((slug) => slug.length > 0);
    const fromTerms = (attribute.terms?.nodes ?? [])
      .map((term) => term.slug?.trim().toLocaleLowerCase("nb-NO") ?? "")
      .filter((slug) => slug.length > 0);
    return [...fromOptions, ...fromTerms];
  });
  if (slugs.length === 0) return null;
  return [...new Set(slugs)];
}

type FileItem = {
  "file-dispname"?: string;
  "file-url"?: string;
};

function parseDocuments(
  metaData: WooProductMetaData[] | null | undefined
): Array<{ label: string; url: string }> | null {
  const raw = getMetaValue(metaData, "file");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, FileItem>;
    const docs = Object.values(parsed)
      .filter(
        (item): item is Required<Pick<FileItem, "file-url">> & FileItem =>
          typeof item?.["file-url"] === "string" && item["file-url"].length > 0
      )
      .map((item) => ({
        label: item["file-dispname"] || item["file-url"]!,
        url: item["file-url"]!,
      }));
    return docs.length > 0 ? docs : null;
  } catch {
    return null;
  }
}

function parseGalleryItemsFromMeta(raw: string | null): ProductGalleryItem[] {
  if (!raw?.trim()) return [];
  const trimmed = raw.trim();

  const toGalleryItem = (value: unknown): ProductGalleryItem | null => {
    if (typeof value === "string") {
      const imageUrl = value.trim();
      if (/^https?:\/\//i.test(imageUrl)) {
        return { imageUrl };
      }
      return null;
    }

    if (!value || typeof value !== "object") {
      return null;
    }

    const item = value as Record<string, unknown>;
    const rawUrl =
      (typeof item.url === "string" && item.url) ||
      (typeof item.sourceUrl === "string" && item.sourceUrl) ||
      (typeof item.src === "string" && item.src) ||
      null;
    if (!rawUrl || !/^https?:\/\//i.test(rawUrl.trim())) {
      return null;
    }

    const altText =
      typeof item.altText === "string"
        ? item.altText.trim()
        : typeof item.alt === "string"
          ? item.alt.trim()
          : "";

    const overlayTextCandidates = [
      item.text,
      item.caption,
      item.title,
      item.description,
    ];
    const text = overlayTextCandidates
      .find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
      ?.toString()
      .trim();

    return {
      imageUrl: rawUrl.trim(),
      altText: altText.length > 0 ? altText : undefined,
      text: text && text.length > 0 ? text : undefined,
    };
  };

  if (/^https?:\/\//i.test(trimmed)) {
    return [{ imageUrl: trimmed }];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const sourceItems = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? Object.values(parsed as Record<string, unknown>)
        : [];

    return sourceItems
      .map((item) => toGalleryItem(item))
      .filter((item): item is ProductGalleryItem => item != null);
  } catch {
    const fallbackImageUrl = parseMetaImageValue(raw);
    return fallbackImageUrl ? [{ imageUrl: fallbackImageUrl }] : [];
  }
}

function parseDimensions(node: {
  length?: string | null;
  width?: string | null;
  height?: string | null;
}): string | null {
  const parts: string[] = [];
  if (node.length) parts.push(node.length);
  if (node.width) parts.push(node.width);
  if (node.height) parts.push(node.height);
  return parts.length > 0 ? parts.join(" × ") + " cm" : null;
}

function parseTechnicalInfoFromMeta(
  metaData: WooProductMetaData[] | null | undefined
): string | null {
  return getMetaValue(metaData, "tekniskdatacustom");
}

function parseVariationAttributes(
  variation: WooProductVariationNode
): ProductAttribute[] | null {
  const attrs = variation.attributes?.nodes ?? [];
  const mapped = attrs
    .map((attribute: WooVariationAttribute): ProductAttribute | null => {
      const label = attribute.label?.trim() || attribute.name?.trim() || "";
      const valueFromValue = attribute.value?.trim() ?? "";
      const valueFromOptions = (attribute.options ?? [])
        .map((option) => option.trim())
        .filter((option) => option.length > 0)
        .join(", ");
      const rawValue = valueFromValue || valueFromOptions;
      if (!label || !rawValue) return null;
      const attrName = attribute.name?.trim();
      // Variation GraphQL `value` is often a slug (e.g. "sort"); clean for display.
      const value = attrName
        ? cleanAttributeOption(rawValue, attrName)
        : rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
      return {
        ...(attrName ? { name: attrName } : {}),
        label,
        value,
      };
    })
    .filter((attribute): attribute is ProductAttribute => attribute != null);

  return mapped.length > 0 ? mapped : null;
}

function mapVariationNode(node: WooProductVariationNode): ProductVariation {
  const { formatted: priceFormatted, numeric: priceNumeric } = normalizePrice(node.price);
  const { formatted: regularPriceFormatted } = normalizePrice(node.regularPrice);
  const onSale = node.onSale === true;
  const saleBadge = onSale
    ? formatSaleBadge(node.regularPrice, node.price, node.onSale) ?? "Tilbud"
    : null;

  const rawEnergyRating =
    getMetaValue(node.metaData, "energy-rating") ??
    getMetaValue(node.metaData, "energy_rating");
  const parsedEnergyBadge = parseMetaImageValue(rawEnergyRating);
  const energyRatingBadgeUrl = parsedEnergyBadge ?? null;
  const energyLabel =
    !parsedEnergyBadge && rawEnergyRating?.trim()
      ? rawEnergyRating.trim()
      : getMetaValue(node.metaData, "energy_label")?.trim() ?? null;
  const energyLabelGuideUrl = parseMetaImageValue(
    getMetaValue(node.metaData, "energy_label_image")
  );

  const badgeFromLetter = !energyRatingBadgeUrl
    ? resolveEuEnergyLabelBadgeUrlFromLetter(energyLabel)
    : null;
  const resolvedBadgeUrl = energyRatingBadgeUrl ?? badgeFromLetter ?? null;

  return {
    id: node.id,
    databaseId: node.databaseId ?? null,
    name: node.name?.trim()
      ? decodeHtmlEntities(node.name.trim())
      : "Variant",
    price: priceFormatted || "—",
    priceNumeric: priceNumeric ?? null,
    regularPrice: regularPriceFormatted || null,
    onSale,
    saleBadge,
    stockStatus: normalizeStockStatus(node.stockStatus),
    sku: node.sku ?? null,
    nobb: getMetaValue(node.metaData, "nobb"),
    gtin: getGtinFromMeta(node.metaData),
    image: node.image
      ? {
          sourceUrl: node.image.sourceUrl,
          altText: node.image.altText ?? undefined,
        }
      : null,
    attributes: parseVariationAttributes(node),
    weight: node.weight ?? null,
    dimensions: parseDimensions(node),
    weightKg: parseWooNumber(node.weight),
    lengthCm: parseWooNumber(node.length),
    widthCm: parseWooNumber(node.width),
    heightCm: parseWooNumber(node.height),
    technicalInfo: parseTechnicalInfoFromMeta(node.metaData),
    energyLabel,
    energyRatingBadgeUrl: resolvedBadgeUrl,
    energyLabelGuideUrl,
  };
}

function extractNumericAttribute(
  node: WooProductNode,
  attributeNames: string[]
): number | null {
  const attrs = node.attributes?.nodes ?? [];
  const attr = attrs.find(
    (a) =>
      attributeNames.some(
        (candidate) => candidate.toLocaleLowerCase("nb-NO") === a.name.toLocaleLowerCase("nb-NO")
      )
  );
  if (!attr) return null;
  const options = Array.isArray(attr.options) ? attr.options : [];
  const candidates = [
    ...getAttributeDisplayValues(attr),
    ...options.map((option) => cleanAttributeOption(option, attr.name)),
    ...options,
  ];

  for (const candidate of candidates) {
    const value = parseNumericAttributeValue(candidate);
    if (value != null) return value;
  }

  return null;
}

/**
 * Woo stores the power range in `pa_effektomrade` ("Effektområde (kw fra, til)")
 * as two terms (e.g. "3" and "9", or "2,7" and "8,4"). The max of those values
 * is the product's max power in kW.
 */
function extractMaxPowerFromRange(node: WooProductNode): number | null {
  const attrs = node.attributes?.nodes ?? [];
  const attr = attrs.find(
    (a) => a.name.toLocaleLowerCase("nb-NO") === "pa_effektomrade"
  );
  if (!attr) return null;

  const values = getAttributeDisplayValues(attr)
    .map((value) => parseNumericAttributeValue(value))
    .filter((value): value is number => value != null);

  return values.length > 0 ? Math.max(...values) : null;
}

function extractBrand(node: WooProductNode): {
  name: string | null;
  slug: string | null;
} {
  const brandNode = node.productBrands?.nodes?.[0];
  return {
    name: brandNode?.name ?? null,
    slug: brandNode?.slug ?? null,
  };
}

/**
 * Map a WooCommerce GraphQL product node to the app Product type.
 */
export function mapWooProductToProduct(node: WooProductNode): Product {
  const { formatted: priceFormatted, numeric: priceNumeric } = normalizePrice(
    node.price
  );
  const { formatted: regularPriceFormatted } = normalizePrice(
    node.regularPrice
  );
  const onSale = node.onSale === true;
  const computedBadge = formatSaleBadge(
    node.regularPrice,
    node.price,
    node.onSale
  );
  const saleBadge = onSale ? (computedBadge ?? "Tilbud") : null;

  const cardImageUrl = pickProductCardImageUrl(node.image);
  const image = cardImageUrl
    ? {
        sourceUrl: cardImageUrl,
        altText: node.image?.altText ?? undefined,
      }
    : null;

  const galleryOnly =
    (node.galleryImages?.nodes?.length ?? 0) > 0
      ? node.galleryImages!.nodes.map((img) => ({
          sourceUrl: img.sourceUrl,
          altText: img.altText ?? undefined,
        }))
      : [];

  const images =
    image && galleryOnly.length > 0
      ? [
          image,
          ...galleryOnly.filter((g) => g.sourceUrl !== image.sourceUrl),
        ]
      : galleryOnly.length > 0
        ? galleryOnly
        : image
          ? [image]
          : null;

  const attributes = parseAttributes(node);
  const attributeTermSlugs = extractAttributeTermSlugs(node);
  const documents = parseDocuments(node.metaData);
  const rawEnergyRating =
    getMetaValue(node.metaData, "energy-rating") ??
    getMetaValue(node.metaData, "energy_rating");
  const rawEnergyLetter = getMetaValue(node.metaData, "energy_label");

  function metaValueLooksLikeImageUrl(raw: string | null): boolean {
    if (!raw?.trim()) return false;
    const t = raw.trim();
    if (/^https?:\/\//i.test(t)) return true;
    return Boolean(parseMetaImageValue(raw));
  }

  const ratingIsBadgeImage = metaValueLooksLikeImageUrl(rawEnergyRating);
  const energyRatingBadgeUrl = ratingIsBadgeImage
    ? parseMetaImageValue(rawEnergyRating) ??
      (rawEnergyRating && /^https?:\/\//i.test(rawEnergyRating.trim())
        ? rawEnergyRating.trim()
        : null)
    : null;

  const energyLabel =
    rawEnergyLetter?.trim() ??
    (rawEnergyRating?.trim() && !ratingIsBadgeImage ? rawEnergyRating.trim() : null) ??
    null;

  const badgeFromLetter = !energyRatingBadgeUrl
    ? resolveEuEnergyLabelBadgeUrlFromLetter(energyLabel)
    : null;
  const resolvedEnergyRatingBadgeUrl =
    energyRatingBadgeUrl ?? badgeFromLetter ?? null;

  const rawEnergyGuide = getMetaValue(node.metaData, "energy_label_image");
  const energyLabelGuideUrl = parseMetaImageValue(rawEnergyGuide);
  const deliveryPeriod = getMetaValue(node.metaData, "delivery-period");
  const nobb = getMetaValue(node.metaData, "nobb");
  const inspirationGalleryFromMeta = parseGalleryItemsFromMeta(
    getMetaValue(node.metaData, "product_inspiration_gallery")
  );
  const legacyInspirationGallery = [1, 2, 3]
    .map((idx) => {
      const imageUrl = parseMetaImageValue(
        getMetaValue(node.metaData, `insp-image-${idx}`)
      );
      if (!imageUrl) return null;

      const text = getMetaValue(node.metaData, `insp-text-${idx}`)?.trim() ?? "";
      return {
        imageUrl,
        text: text.length > 0 ? text : undefined,
      };
    })
    .filter(
      (item): item is { imageUrl: string; text: string | undefined } =>
        item != null
    );
  const inspirationGallery =
    inspirationGalleryFromMeta.length > 0
      ? inspirationGalleryFromMeta
      : legacyInspirationGallery;
  const blueprintGallery = parseGalleryItemsFromMeta(
    getMetaValue(node.metaData, "product_blueprint_gallery")
  );

  const colorAttr = node.attributes?.nodes?.find(
    (a) =>
      a.name === "pa_farge" &&
      ((Array.isArray(a.options) && a.options.length > 0) ||
        (a.terms?.nodes?.length ?? 0) > 0)
  );
  const color = colorAttr
    ? getAttributeDisplayValues(colorAttr).join(", ")
    : null;

  const peisTypeAttr = node.attributes?.nodes?.find(
    (a) =>
      a.name === "pa_peistype" &&
      ((Array.isArray(a.options) && a.options.length > 0) ||
        (a.terms?.nodes?.length ?? 0) > 0)
  );
  const fireplaceType = peisTypeAttr
    ? getAttributeDisplayValues(peisTypeAttr).join(", ")
    : null;

  const maxPower =
    extractNumericAttribute(node, [
      "pa_makseffekt-kw",
      "pa_maks-effekt-kw",
      "pa_makseffekt",
    ]) ?? extractMaxPowerFromRange(node);
  const nominalPower = extractNumericAttribute(node, [
    "pa_nominelleffekt-kw",
    "pa_nominell-effekt-kw",
    "pa_nominelleffekt",
  ]);

  const categories =
    node.productCategories?.nodes?.map((c) => ({
      name: decodeHtmlEntities(c.name),
      slug: c.slug,
    })) ?? null;

  const { name: brand, slug: brandSlug } = extractBrand(node);
  const displayedInStore = parseDisplayedInStoreFromUtstiltMeta(node.metaData);

  const productTagsFromNodes = (node.productTags?.nodes ?? [])
    .map((t) => ({
      name: t.name?.trim() ?? "",
      slug: t.slug?.trim() ?? "",
    }))
    .filter((t) => t.name.length > 0);
  const tags = productTagsFromNodes.length > 0 ? productTagsFromNodes : null;
  const gtin = getGtinFromMeta(node.metaData);

  const recommendedAccessories =
    node.upsell?.nodes && node.upsell.nodes.length > 0
      ? node.upsell.nodes.map(mapWooProductToProduct)
      : null;

  const crossSellProducts =
    node.crossSell?.nodes && node.crossSell.nodes.length > 0
      ? node.crossSell.nodes.map(mapWooProductToProduct)
      : null;

  const relatedProducts =
    node.related?.nodes && node.related.nodes.length > 0
      ? node.related.nodes.map(mapWooProductToProduct)
      : null;
  const description = node.description ?? null;
  const descriptionCardsSource =
    getMetaValue(node.metaData, "product_description_cards") ?? description;
  const descriptionCards =
    parseProductDescriptionCards(descriptionCardsSource) ??
    parseProductDescriptionCards(description);
  const variations =
    node.variations?.nodes && node.variations.nodes.length > 0
      ? node.variations.nodes.map((variationNode) => mapVariationNode(variationNode))
      : null;

  const productType = mapWooTypenameToProductType(node.__typename);

  const decodedName = node.name?.trim()
    ? decodeHtmlEntities(node.name.trim())
    : "";

  return {
    id: node.id,
    name: decodedName || node.name,
    slug: node.slug,
    productType,
    image: image
      ? {
          sourceUrl: image.sourceUrl,
          ...(image.altText
            ? { altText: decodeHtmlEntities(image.altText) }
            : {}),
        }
      : image,
    price: priceFormatted || "—",
    priceNumeric: priceNumeric ?? null,
    regularPrice: regularPriceFormatted || null,
    onSale,
    saleBadge: saleBadge ?? null,
    stockStatus: normalizeStockStatus(node.stockStatus),
    sku: node.sku ?? null,
    brand: brand ? decodeHtmlEntities(brand) : brand,
    brandSlug,
    displayedInStore,
    energyLabel,
    energyRatingBadgeUrl: resolvedEnergyRatingBadgeUrl,
    energyLabelGuideUrl,
    color: color ? decodeHtmlEntities(color) : color,
    fireplaceType: fireplaceType
      ? decodeHtmlEntities(fireplaceType)
      : fireplaceType,
    maxPower,
    nominalPower,
    images,
    shortDescription: node.shortDescription ?? null,
    description,
    descriptionCards,
    technicalInfo: node.technicalInfo ?? null,
    attributes: attributes && attributes.length > 0 ? attributes : null,
    attributeTermSlugs,
    weight: node.weight ?? null,
    dimensions: parseDimensions(node),
    weightKg: parseWooNumber(node.weight),
    lengthCm: parseWooNumber(node.length),
    widthCm: parseWooNumber(node.width),
    heightCm: parseWooNumber(node.height),
    documents: documents && documents.length > 0 ? documents : undefined,
    categories,
    nobb,
    gtin,
    tags,
    deliveryPeriod,
    inspirationGallery: inspirationGallery.length > 0 ? inspirationGallery : null,
    blueprintGallery: blueprintGallery.length > 0 ? blueprintGallery : null,
    variations,
    recommendedAccessories,
    crossSellProducts,
    relatedProducts,
  };
}

export function mapWooProductToSearchProduct(node: WooProductNode): SearchProduct {
  const { formatted: priceFormatted } = normalizePrice(node.price);
  const { name: brand } = extractBrand(node);

  return {
    id: node.id,
    name: node.name?.trim()
      ? decodeHtmlEntities(node.name.trim())
      : node.name,
    slug: node.slug,
    image: (() => {
      const url = pickProductCardImageUrl(node.image);
      if (!url) return null;
      return {
        sourceUrl: url,
        altText: node.image?.altText
          ? decodeHtmlEntities(node.image.altText)
          : undefined,
      };
    })(),
    brand: brand ? decodeHtmlEntities(brand) : brand,
    price: priceFormatted || "—",
    sku: node.sku ?? null,
    categories:
      node.productCategories?.nodes?.map((category) => ({
        name: decodeHtmlEntities(category.name),
        slug: category.slug,
      })) ?? null,
  };
}
