import "server-only";

import type { SitemapEntry, SitemapManifestItem } from "@/lib/seo/sitemap-data";

const XML_DECLARATION = `<?xml version="1.0" encoding="UTF-8"?>`;
const IMAGE_NAMESPACE = "http://www.google.com/schemas/sitemap-image/1.1";
const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderUrlset(entries: SitemapEntry[], baseUrl: string): string {
  const hasImages = entries.some((entry) => entry.images?.length);
  const imageAttr = hasImages ? ` xmlns:image="${IMAGE_NAMESPACE}"` : "";

  const urls = entries
    .map((entry) => {
      const loc = `${baseUrl}${entry.path}`;
      const parts = [`    <loc>${escapeXml(loc)}</loc>`];
      if (entry.lastModified) {
        parts.push(`    <lastmod>${entry.lastModified}</lastmod>`);
      }
      for (const image of entry.images ?? []) {
        parts.push(
          `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`
        );
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `${XML_DECLARATION}\n<urlset xmlns="${SITEMAP_NAMESPACE}"${imageAttr}>\n${urls}\n</urlset>\n`;
}

export function renderSitemapIndex(
  items: SitemapManifestItem[],
  baseUrl: string
): string {
  const sitemaps = items
    .map((item) => {
      const loc = `${baseUrl}/sitemaps/${item.name}`;
      const parts = [`    <loc>${escapeXml(loc)}</loc>`];
      if (item.lastModified) {
        parts.push(`    <lastmod>${item.lastModified}</lastmod>`);
      }
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `${XML_DECLARATION}\n<sitemapindex xmlns="${SITEMAP_NAMESPACE}">\n${sitemaps}\n</sitemapindex>\n`;
}
