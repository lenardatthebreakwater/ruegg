import type {
  ServiceGalleryItem,
  ServicePostContentSection,
} from "@/lib/data/service-pages";
import { cleanupText } from "@/lib/content-mapping/local-montering-parser-rules";
import type { WpPostNode } from "@/lib/graphql/types";

const MAX_BLOG_SLOT = 20;

type ImageSlot = {
  imageUrl: string;
  altText?: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

function getFieldMap(post: WpPostNode): Record<string, unknown> {
  const map: Record<string, unknown> = {};

  const addEntries = (record: Record<string, unknown> | null) => {
    if (!record) return;
    for (const [key, value] of Object.entries(record)) {
      map[key] = value;
    }
  };

  addEntries(post.customFields ?? null);
  addEntries(toRecord(post));

  return map;
}

function getValueFromMap(
  map: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (key in map) return map[key];
  }

  const normalizedLookup = new Set(keys.map(normalizeKey));
  for (const [key, value] of Object.entries(map)) {
    if (normalizedLookup.has(normalizeKey(key))) {
      return value;
    }
  }

  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string") {
    const cleaned = cleanupText(value);
    return cleaned.length > 0 ? cleaned : null;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}

/** Keep WYSIWYG HTML for body fields (lists, bold, links). */
function toHtml(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getSlotFieldValue(
  map: Record<string, unknown>,
  base: string,
  slot: number
): unknown {
  return getValueFromMap(map, [
    `${base}-${slot}`,
    `${base}_${slot}`,
    `${base}${slot}`,
  ]);
}

export function getBlogHeading(post: WpPostNode, slot: number): string | null {
  return toText(getSlotFieldValue(getFieldMap(post), "blogheading", slot));
}

/** Plain text for lokalmontering hero/meta (strips WYSIWYG tags). */
export function getBlogParagraph(post: WpPostNode, slot: number): string | null {
  return toText(getSlotFieldValue(getFieldMap(post), "blogparagraph", slot));
}

/** HTML for editorial blog body sections. */
export function getBlogParagraphHtml(
  post: WpPostNode,
  slot: number
): string | null {
  return toHtml(getSlotFieldValue(getFieldMap(post), "blogparagraph", slot));
}

export function getSectionHeading(
  post: WpPostNode,
  slot: number
): string | null {
  return toText(getSlotFieldValue(getFieldMap(post), "sectionheading", slot));
}

export function getSectionBody(post: WpPostNode, slot: number): string | null {
  return toHtml(getSlotFieldValue(getFieldMap(post), "sectionbody", slot));
}

function toHttpImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const imageUrl = value.trim();
  return /^https?:\/\//i.test(imageUrl) ? imageUrl : null;
}

export function getBlogImage(post: WpPostNode, slot: number): ImageSlot | null {
  const map = getFieldMap(post);
  const raw = getSlotFieldValue(map, "blogimage", slot);
  if (!raw) return null;

  if (typeof raw === "string") {
    const imageUrl = toHttpImageUrl(raw);
    return imageUrl ? { imageUrl } : null;
  }

  // Attachment IDs must be resolved to URLs upstream (server-posts REST media).
  if (typeof raw === "number") {
    return null;
  }

  if (Array.isArray(raw)) {
    const first = raw[0];
    const imageUrl = toHttpImageUrl(first);
    return imageUrl ? { imageUrl } : null;
  }

  const record = toRecord(raw);
  if (!record) return null;

  const imageUrl =
    toHttpImageUrl(record.url) ??
    toHttpImageUrl(record.sourceUrl) ??
    toHttpImageUrl(record.imageUrl) ??
    toHttpImageUrl(record.src);
  if (!imageUrl) return null;

  const altText = toText(record.altText) ?? toText(record.alt);
  return altText ? { imageUrl, altText } : { imageUrl };
}

function parseGallerySource(raw: unknown): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        const record = toRecord(item);
        return (
          toText(record?.url) ??
          toText(record?.sourceUrl) ??
          toText(record?.imageUrl) ??
          toText(record?.src) ??
          ""
        );
      })
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];

    try {
      const parsed = JSON.parse(value) as unknown;
      return parseGallerySource(parsed);
    } catch {
      return value
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  const record = toRecord(raw);
  if (!record) return [];

  return Object.values(record)
    .map((item) => toText(item) ?? "")
    .filter(Boolean);
}

export function getJetGalleryItems(
  post: WpPostNode,
  place: string
): ServiceGalleryItem[] {
  const map = getFieldMap(post);
  const raw =
    getValueFromMap(map, ["jetgallery1", "jetgallery_1", "jetGallery1"]) ?? null;
  const urls = parseGallerySource(raw);

  const deduped = [...new Set(urls)];
  return deduped.map((imageUrl, index) => ({
    id: `lokal-montering-cms-${index + 1}`,
    imageUrl,
    alt: `Peismontering i ${place} - bilde ${index + 1}`,
  }));
}

export function getPostContentSections(post: WpPostNode): ServicePostContentSection[] {
  const map = getFieldMap(post);
  const sections: ServicePostContentSection[] = [];

  for (let slot = 1; slot <= MAX_BLOG_SLOT; slot += 1) {
    if (slot === 1 || slot === 5) continue;

    const title = toText(getSlotFieldValue(map, "blogheading", slot));
    const description = toText(getSlotFieldValue(map, "blogparagraph", slot));
    if (!title && !description) continue;

    sections.push({
      id: `lokal-montering-post-section-${slot}`,
      title: title ?? "",
      description: description ?? "",
    });
  }

  return sections;
}
