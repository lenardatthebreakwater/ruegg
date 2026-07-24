import {
  BLOG_READING_WPM,
  isBlogCategorySlug,
  isLokalmonteringSlug,
  type BlogCategorySlug,
} from "@/lib/blog/constants";
import type {
  BlogAuthor,
  BlogCategory,
  BlogImage,
  BlogPost,
  BlogSection,
  BlogTldrItem,
} from "@/lib/blog/types";
import {
  getBlogHeading,
  getBlogImage,
  getBlogParagraphHtml,
  getSectionBody,
  getSectionHeading,
} from "@/lib/content-mapping/local-montering-custom-field-extractors";
import { cleanupText } from "@/lib/content-mapping/local-montering-parser-rules";
import type { WpPostNode } from "@/lib/graphql/types";

const MAX_BLOG_SLOT = 20;
const MAX_TLDR_SLOT = 3;

function stripHtml(value: string): string {
  return cleanupText(
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function toFeaturedImage(post: WpPostNode): BlogImage | null {
  const node = post.featuredImage?.node;
  const url = node?.sourceUrl?.trim();
  if (!url) return null;
  const alt = node?.altText?.trim();
  return alt ? { url, alt } : { url };
}

function toAuthor(post: WpPostNode): BlogAuthor | null {
  const node = post.author?.node;
  if (!node?.name?.trim()) return null;
  return {
    id: typeof node.databaseId === "number" ? node.databaseId : null,
    name: node.name.trim(),
    slug: node.slug?.trim() || null,
  };
}

function toCategories(post: WpPostNode): BlogCategory[] {
  return (post.categories?.nodes ?? []).map((category) => ({
    name: category.name,
    slug: isBlogCategorySlug(category.slug)
      ? (category.slug as BlogCategorySlug)
      : category.slug,
  }));
}

function buildSections(post: WpPostNode): BlogSection[] {
  const sections: BlogSection[] = [];

  for (let slot = 1; slot <= MAX_BLOG_SLOT; slot += 1) {
    const heading = getBlogHeading(post, slot);
    const html = getBlogParagraphHtml(post, slot);
    const imageSlot = getBlogImage(post, slot);
    const image: BlogImage | null = imageSlot?.imageUrl
      ? {
          url: imageSlot.imageUrl,
          ...(imageSlot.altText ? { alt: imageSlot.altText } : {}),
        }
      : null;

    if (!heading && !html && !image) continue;

    sections.push({
      slot,
      heading,
      html,
      image,
    });
  }

  return sections;
}

function buildTldrItems(post: WpPostNode): BlogTldrItem[] {
  const items: BlogTldrItem[] = [];

  for (let slot = 1; slot <= MAX_TLDR_SLOT; slot += 1) {
    const heading = getSectionHeading(post, slot);
    const html = getSectionBody(post, slot);
    if (!heading && !html) continue;
    items.push({ slot, heading, html });
  }

  return items;
}

function getGalleryUrls(post: WpPostNode): string[] {
  const fields = post.customFields ?? {};
  const raw =
    fields.jetgallery1 ?? fields.jetgallery_1 ?? fields.jetGallery1 ?? null;

  if (!raw) return [];

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return [
          ...new Set(
            parsed
              .map((item) => (typeof item === "string" ? item.trim() : ""))
              .filter(Boolean)
          ),
        ];
      }
    } catch {
      // comma / newline separated URLs
    }
    return [
      ...new Set(
        value
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
  }

  if (Array.isArray(raw)) {
    return [
      ...new Set(
        raw
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

function computeReadingTimeMinutes(sections: BlogSection[], excerptHtml: string | null): number {
  const parts: string[] = [];
  if (excerptHtml) parts.push(stripHtml(excerptHtml));
  for (const section of sections) {
    if (section.heading) parts.push(section.heading);
    if (section.html) parts.push(stripHtml(section.html));
  }
  const words = parts
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / BLOG_READING_WPM));
}

/** Public path for an editorial blog post (root permalink). */
export function buildBlogPostPath(slug: string): string {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return `/${normalized}/`;
}

/**
 * Maps a WP post (with REST customFields hydrated) to the editorial BlogPost view model.
 * Returns null for lokalmontering URL slugs or posts missing a title/slug.
 */
export function mapWpPostToBlogPost(post: WpPostNode): BlogPost | null {
  const slug = post.slug?.trim();
  if (!slug || isLokalmonteringSlug(slug)) return null;

  const title = post.title?.trim();
  if (!title) return null;

  const excerptHtml = post.excerpt?.trim() || null;
  const sections = buildSections(post);
  const tldrItems = buildTldrItems(post);

  return {
    id: post.id,
    databaseId: post.databaseId ?? 0,
    slug,
    path: buildBlogPostPath(slug),
    title,
    excerptHtml,
    excerptText: excerptHtml ? stripHtml(excerptHtml) : null,
    date: post.date ?? null,
    modified: post.modified ?? null,
    author: toAuthor(post),
    categories: toCategories(post),
    featuredImage: toFeaturedImage(post),
    sections,
    tldrItems,
    galleryUrls: getGalleryUrls(post),
    readingTimeMinutes: computeReadingTimeMinutes(sections, excerptHtml),
  };
}
