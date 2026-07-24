import { getSitemapManifest } from "@/lib/seo/sitemap-data";
import { renderSitemapIndex } from "@/lib/seo/sitemap-xml";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

/**
 * Sitemap index pointing at the typed child sitemaps under /sitemaps/*.xml.
 * Prerendered at build time and refreshed hourly via ISR.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const manifest = await getSitemapManifest();
  const xml = renderSitemapIndex(manifest, getSiteBaseUrl());

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
