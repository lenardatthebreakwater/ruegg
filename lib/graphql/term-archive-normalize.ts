import type {
  TermArchiveBottomBlock,
  TermArchiveFaqItem,
} from "@/lib/graphql/types";
import { stripHtmlToText } from "@/lib/products/description-cards";
import type { FAQItem } from "@/lib/data/homepage";

type RawBottomBlock = {
  index?: number | null;
  imageUrl?: string | null;
  inspImageUrl?: string | null;
  textHtml?: string | null;
  linkText?: string | null;
  linkUrl?: string | null;
} | null;

type RawFaqItem = {
  question?: string | null;
  answer?: string | null;
} | null;

export function normalizeTermArchiveBottomBlocks(
  raw: RawBottomBlock[] | null | undefined
): TermArchiveBottomBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((block) => {
      if (!block || typeof block.index !== "number") return null;
      const imageUrl = block.imageUrl?.trim() || null;
      const inspImageUrl = block.inspImageUrl?.trim() || null;
      const textHtml = block.textHtml?.trim() || null;
      const linkText = block.linkText?.trim() || null;
      const linkUrl = block.linkUrl?.trim() || null;
      if (!imageUrl && !inspImageUrl && !textHtml && !linkText && !linkUrl) {
        return null;
      }
      return {
        index: block.index,
        imageUrl,
        inspImageUrl,
        textHtml,
        linkText,
        linkUrl,
      };
    })
    .filter((block): block is TermArchiveBottomBlock => block != null);
}

export function normalizeTermArchiveFaq(
  raw: RawFaqItem[] | null | undefined
): TermArchiveFaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      const question = item?.question?.trim() || "";
      const answer = item?.answer?.trim() || "";
      if (!question || !stripHtmlToText(answer).trim()) return null;
      return {
        id: `archive-faq-${i + 1}`,
        question,
        answer,
      };
    })
    .filter((item): item is TermArchiveFaqItem => item != null);
}

/** Map GraphQL FAQ rows to homepage FAQItem shape for FAQSection. */
export function termArchiveFaqToFaqItems(
  items: TermArchiveFaqItem[]
): FAQItem[] {
  return items.map((item) => ({
    id: item.id,
    question: item.question,
    // Accordion shows plain text; WP answers may include light HTML.
    answer: stripHtmlToText(item.answer).replace(/\s+/g, " ").trim() || item.answer,
  }));
}

export function isTermArchiveFieldError(message: string): boolean {
  return (
    (message.includes("headerImage1") ||
      message.includes("archiveBottomBlocks") ||
      message.includes("archiveFaq")) &&
    message.includes("Cannot query field")
  );
}

export function isTermArchiveFaqFieldError(message: string): boolean {
  return message.includes("archiveFaq") && message.includes("Cannot query field");
}
