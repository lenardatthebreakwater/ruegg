import { notFound } from "next/navigation";

import {
  getSitemapEntriesByName,
  getSitemapManifest,
} from "@/lib/seo/sitemap-data";
import { renderUrlset } from "@/lib/seo/sitemap-xml";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

/**
 * Child sitemaps (pages.xml, categories.xml, reservedeler.xml,
 * products-N.xml). Prerendered at build time and refreshed hourly via ISR.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  const manifest = await getSitemapManifest();
  return manifest.map((item) => ({ name: item.name }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
): Promise<Response> {
  const { name } = await params;
  // null = unknown name → 404; [] = known but empty → valid empty urlset (omitted from index).
  const entries = await getSitemapEntriesByName(decodeURIComponent(name));
  if (!entries) notFound();

  const xml = renderUrlset(entries, getSiteBaseUrl());

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
