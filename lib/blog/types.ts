import type { BlogCategorySlug } from "@/lib/blog/constants";

export type BlogImage = {
  url: string;
  alt?: string;
};

/**
 * One editorial block from blogheading-N + blogparagraph-N + optional blogimage-N.
 * Slot numbers match WP meta (1–20).
 */
export type BlogSection = {
  slot: number;
  heading: string | null;
  /** HTML from blogparagraph-N */
  html: string | null;
  image: BlogImage | null;
};

/** One “Kort fortalt” box from sectionheading-N + sectionbody-N (slots 1–3). */
export type BlogTldrItem = {
  slot: number;
  heading: string | null;
  /** HTML from sectionbody-N (minimal WYSIWYG: lists, bold, links). */
  html: string | null;
};

export type BlogAuthor = {
  id: number | null;
  name: string;
  slug: string | null;
};

export type BlogCategory = {
  name: string;
  slug: BlogCategorySlug | string;
};

export type BlogPost = {
  id: string;
  databaseId: number;
  slug: string;
  /** Public path with trailing slash: `/${slug}/` */
  path: string;
  title: string;
  excerptHtml: string | null;
  excerptText: string | null;
  date: string | null;
  modified: string | null;
  author: BlogAuthor | null;
  categories: BlogCategory[];
  featuredImage: BlogImage | null;
  sections: BlogSection[];
  /** Quick-read boxes; empty when none of the three slots have content. */
  tldrItems: BlogTldrItem[];
  galleryUrls: string[];
  readingTimeMinutes: number;
};
