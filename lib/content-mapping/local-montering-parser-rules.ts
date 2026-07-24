import type { FAQItem } from "@/lib/data/homepage";

type HtmlSection = {
  title: string;
  html: string;
};

export type ParsedLocalMonteringContent = {
  introText: string | null;
  offerText: string | null;
  areaDescription: string | null;
  areas: string[];
  pricesText: string | null;
  gasText: string | null;
  faqItems: FAQItem[];
};

const ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  aring: "å",
  Aring: "Å",
  oslash: "ø",
  Oslash: "Ø",
  aelig: "æ",
  AElig: "Æ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#?\w+);/g, (_, token: string) => {
    if (token.startsWith("#x")) {
      const code = Number.parseInt(token.slice(2), 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    }
    if (token.startsWith("#")) {
      const code = Number.parseInt(token.slice(1), 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    }
    return ENTITY_MAP[token] ?? "";
  });
}

export function cleanupText(value: string): string {
  const withoutTags = value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const normalized = decodeEntities(withoutTags)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

function normalizeForMatch(value: string): string {
  return cleanupText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sectionHeadingMatches(title: string, keywords: string[]): boolean {
  const normalizedTitle = normalizeForMatch(title);
  return keywords.some((keyword) => normalizedTitle.includes(keyword));
}

function splitHtmlByHeadings(html: string): HtmlSection[] {
  const matches = [...html.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi)];
  if (matches.length === 0) {
    return [{ title: "", html }];
  }

  const sections: HtmlSection[] = [];
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    if (!current || current.index == null) continue;
    const nextStart = matches[index + 1]?.index ?? html.length;
    const rawTitle = current[1] ?? "";
    sections.push({
      title: cleanupText(rawTitle),
      html: html.slice(current.index + current[0].length, nextStart),
    });
  }

  return sections;
}

function findSection(sections: HtmlSection[], keywords: string[]): HtmlSection | null {
  return sections.find((section) => sectionHeadingMatches(section.title, keywords)) ?? null;
}

function collectParagraphText(html: string): string | null {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => cleanupText(match[1] ?? ""))
    .filter((text) => text.length > 0);

  if (paragraphs.length === 0) {
    const fallback = cleanupText(html);
    return fallback.length > 0 ? fallback : null;
  }

  return paragraphs.join(" ");
}

function collectListItems(html: string): string[] {
  const listItems = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => cleanupText(match[1] ?? ""))
    .filter((text) => text.length > 1);

  if (listItems.length > 0) return listItems;

  return cleanupText(html)
    .split(/[–\-•]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2 && !/^\d+$/.test(line));
}

function collectFaqItems(html: string): FAQItem[] {
  const entries = [...html.matchAll(/<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>([\s\S]*?)(?=<h[3-6][^>]*>|$)/gi)]
    .map((match, index) => {
      const question = cleanupText(match[1] ?? "");
      const answer = collectParagraphText(match[2] ?? "");
      if (!question || !answer) return null;
      return {
        id: `lokal-faq-${index + 1}`,
        question,
        answer,
      };
    })
    .filter((entry): entry is FAQItem => entry != null);

  if (entries.length > 0) return entries;

  // Fallback: build Q/A pairs from text lines if headings are missing.
  const lines = cleanupText(html)
    .split(/\s(?=[A-ZÆØÅ][^?]{10,}\?)/g)
    .map((line) => line.trim())
    .filter(Boolean);

  const fallbackItems: FAQItem[] = [];
  for (let index = 0; index < lines.length - 1; index += 1) {
    const question = lines[index] ?? "";
    const answer = lines[index + 1] ?? "";
    if (!question.endsWith("?") || answer.endsWith("?")) continue;
    fallbackItems.push({
      id: `lokal-faq-fallback-${fallbackItems.length + 1}`,
      question,
      answer,
    });
  }

  return fallbackItems;
}

function removeMarketingNoise(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/Som din lokale peismont[oø]r[^.]*\./gi, "")
    .replace(/Som erfaren peismont[oø]r[^.]*\./gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function parseLocalMonteringContent(html: string): ParsedLocalMonteringContent {
  const sections = splitHtmlByHeadings(html);

  const introSection = sections[0] ?? null;
  const offerSection = findSection(sections, ["befaring", "tilbud"]);
  const whereSection = findSection(sections, ["hvor vi monterer", "hvor vi installerer"]);
  const pricesSection = findSection(sections, ["priser", "hva koster"]);
  const gasSection = findSection(sections, ["gasspeis", "gassovn"]);
  const faqSection = findSection(sections, ["ofte stilte", "faq"]);

  return {
    introText: removeMarketingNoise(collectParagraphText(introSection?.html ?? "")),
    offerText: removeMarketingNoise(collectParagraphText(offerSection?.html ?? "")),
    areaDescription: collectParagraphText(whereSection?.html ?? ""),
    areas: collectListItems(whereSection?.html ?? ""),
    pricesText: collectParagraphText(pricesSection?.html ?? ""),
    gasText: collectParagraphText(gasSection?.html ?? ""),
    faqItems: collectFaqItems(faqSection?.html ?? ""),
  };
}
