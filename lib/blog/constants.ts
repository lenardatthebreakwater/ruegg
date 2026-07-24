/** WP category slugs included in the editorial blog archive and root singles. */
export const BLOG_CATEGORY_SLUGS = [
  "inspirasjon",
  "nyheter",
  "peismontering",
  "tips-og-rad",
] as const;

export type BlogCategorySlug = (typeof BLOG_CATEGORY_SLUGS)[number];

export const BLOG_CATEGORY_LABELS: Record<BlogCategorySlug, string> = {
  inspirasjon: "Inspirasjon",
  nyheter: "Nyheter",
  peismontering: "Peismontering",
  "tips-og-rad": "Tips og råd",
};

/** Lokalmontering public URL pattern (rewritten to /lokalmontering/[slug]). */
export function isLokalmonteringSlug(slug: string): boolean {
  return /^peismontering-(i|pa)-/i.test(slug.replace(/^\/+|\/+$/g, ""));
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return (BLOG_CATEGORY_SLUGS as readonly string[]).includes(value);
}

/** Words per minute for computed reading time. */
export const BLOG_READING_WPM = 200;
