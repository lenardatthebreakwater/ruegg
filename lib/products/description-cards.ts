export type ProductDescriptionCardKey = string;

export type ProductDescriptionCardIconKey = "flame" | "gauge" | "wrench";

export type ProductDescriptionCardDefinition = {
  key: ProductDescriptionCardKey;
  title: string;
  iconKey: ProductDescriptionCardIconKey;
};

export type ProductDescriptionCardSection = ProductDescriptionCardDefinition & {
  content: string;
};

export const PRODUCT_DESCRIPTION_CARD_DEFINITIONS: ProductDescriptionCardDefinition[] = [
  {
    key: "ytelse",
    title: "Ytelse",
    iconKey: "flame",
  },
  {
    key: "forbruk",
    title: "Forbruk og effektivitet",
    iconKey: "gauge",
  },
  {
    key: "installasjon",
    title: "Installasjon",
    iconKey: "wrench",
  },
];

const CARD_MARKER_REGEX = /^\[CARD:([a-z0-9_-]+)(?:\|(.+))?\]$/i;
const DEFAULT_ICON_KEY: ProductDescriptionCardIconKey = "flame";

function getDefinitionByKey(key: string): ProductDescriptionCardDefinition | undefined {
  return PRODUCT_DESCRIPTION_CARD_DEFINITIONS.find((item) => item.key === key);
}

function toTitleCaseWord(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

function formatTitleFromKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(toTitleCaseWord)
    .join(" ");
}

function codePointToChar(code: number, fallback: string): string {
  // Valid Unicode scalar values only — invalid points throw in fromCodePoint.
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return fallback;
  if (code >= 0xd800 && code <= 0xdfff) return fallback;
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
}

/** Decode common + numeric/hex HTML entities (e.g. Woo `&#8211;` → –). */
export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&ensp;/gi, " ")
    .replace(/&emsp;/gi, " ")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "…")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => {
      return codePointToChar(Number.parseInt(hex, 16), match);
    })
    .replace(/&#(\d+);/g, (match, dec: string) => {
      return codePointToChar(Number.parseInt(dec, 10), match);
    })
    // `&amp;` last so sequences like `&amp;#8211;` still decode fully.
    .replace(/&amp;/gi, "&");
}

export function stripHtmlToText(input: string): string {
  const withLineBreaks = input
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(withoutTags).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function parseProductDescriptionCards(
  description: string | null | undefined
): ProductDescriptionCardSection[] | null {
  if (!description?.trim()) {
    return null;
  }

  const normalized = stripHtmlToText(description).replace(/\r\n/g, "\n");
  if (!normalized) {
    return null;
  }

  const contentByKey = new Map<string, string[]>();
  const customTitleByKey = new Map<string, string>();
  const keyOrder: string[] = [];
  let activeKey: string | null = null;

  const lines = normalized.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    const markerMatch = trimmed.match(CARD_MARKER_REGEX);

    if (markerMatch) {
      const markerKey = markerMatch[1].toLowerCase();
      const rawCustomTitle = markerMatch[2]?.trim() ?? "";
      if (rawCustomTitle) {
        customTitleByKey.set(markerKey, rawCustomTitle);
      }
      activeKey = markerKey;
      if (!contentByKey.has(markerKey)) {
        contentByKey.set(markerKey, []);
        keyOrder.push(markerKey);
      }
      continue;
    }

    if (!activeKey || !trimmed) {
      continue;
    }

    const current = contentByKey.get(activeKey) ?? [];
    current.push(trimmed);
    contentByKey.set(activeKey, current);
  }

  const sections = keyOrder
    .map((key) => {
      const linesForCard = contentByKey.get(key) ?? [];
      const content = linesForCard.join(" ").replace(/\s+/g, " ").trim();

      if (!content) {
        return null;
      }

      const definition = getDefinitionByKey(key);
      const customTitle = customTitleByKey.get(key);

      return {
        key,
        title: customTitle ?? definition?.title ?? formatTitleFromKey(key),
        iconKey: definition?.iconKey ?? DEFAULT_ICON_KEY,
        content,
      };
    })
    .filter((section): section is ProductDescriptionCardSection => section != null);

  return sections.length > 0 ? sections : null;
}

type ProductDescriptionSource = {
  descriptionCards?: ProductDescriptionCardSection[] | null;
  shortDescription?: string | null;
  description?: string | null;
};

export function getDescriptionCardsPlainText(
  descriptionCards: ProductDescriptionCardSection[] | null | undefined
): string | null {
  if (!descriptionCards || descriptionCards.length === 0) {
    return null;
  }

  const text = descriptionCards
    .map((section) => `${section.title}: ${section.content}`)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0 ? text : null;
}

export function resolveProductDescriptionText(source: ProductDescriptionSource): string {
  const fromCards = getDescriptionCardsPlainText(source.descriptionCards);
  if (fromCards) {
    return fromCards;
  }

  const fallback = source.shortDescription ?? source.description ?? "";
  return fallback ? stripHtmlToText(fallback) : "";
}
