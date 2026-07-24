import { buildLlmsTxt } from "@/lib/seo/llms-txt";

export const runtime = "nodejs";
export const revalidate = 86400;

/**
 * llmstxt.org — curated Markdown index for AI agents.
 * Catch-all Workers Route already sends this to Next (not a WP exclusion).
 */
export async function GET() {
  const body = buildLlmsTxt();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
