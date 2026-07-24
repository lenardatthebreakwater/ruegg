/**
 * OpenNext custom Worker entry.
 * Re-exports Durable Object classes used by the incremental/tag caches so
 * workerd/wrangler always see them as top-level Worker exports.
 *
 * `.open-next/worker.js` is produced by `opennextjs-cloudflare build` after the
 * Next.js pre-build TypeScript pass, so clean trees lack that module yet.
 * Use `@ts-ignore` (not `@ts-expect-error`): local trees with a prior build have
 * the module, so `@ts-expect-error` would become an unused-directive failure.
 *
 * @see https://opennext.js.org/cloudflare/howtos/custom-worker
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- @ts-expect-error breaks when .open-next/worker.js already exists locally
// @ts-ignore OpenNext generates `./.open-next/worker.js` after the pre-build TypeScript pass
import { default as handler } from "./.open-next/worker.js";

/** Browser must always revalidate HTML/RSC shells (see applyDocumentBrowserCacheHeaders). */
const BROWSER_DOCUMENT_CACHE_CONTROL =
  "private, no-cache, max-age=0, must-revalidate";

function contentTypeIsHtmlOrRsc(contentType: string | null): boolean {
  if (!contentType) return false;
  const ct = contentType.toLowerCase();
  return ct.includes("text/html") || ct.includes("text/x-component");
}

function cacheControlAlreadyBrowserRevalidate(cacheControl: string): boolean {
  const cc = cacheControl.toLowerCase();
  // Only skip when the browser is already told not to reuse without revalidation.
  // Do not treat bare `must-revalidate` / `s-maxage` as sufficient (Next ISR case).
  return (
    /(?:^|[,;\s])no-store(?:$|[,;\s])/.test(cc) ||
    /(?:^|[,;\s])no-cache(?:$|[,;\s=])/.test(cc) ||
    /(?:^|[,;\s])max-age=0(?:$|[,;\s])/.test(cc)
  );
}

function readDirectiveSeconds(
  cacheControl: string,
  name: "s-maxage" | "stale-while-revalidate"
): number | null {
  const match = cacheControl.match(
    new RegExp(`(?:^|[,\\s])${name}=(\\d+)(?:$|[,\\s])`, "i")
  );
  if (!match) return null;
  const value = Number.parseInt(match[1]!, 10);
  return Number.isFinite(value) ? value : null;
}

/**
 * Next ISR emits `Cache-Control: s-maxage=…, stale-while-revalidate=…` without a
 * browser `max-age=0` / `must-revalidate`. Chrome can keep that HTML/RSC shell and
 * later request `/_next/static` chunks for a pruned buildId (KEEP_BUILD_IDS=1),
 * causing 404s / broken PDPs after deploy. Force browser revalidation; keep CDN
 * TTL via CDN / Cloudflare-CDN Cache-Control. OpenNext ISR itself uses R2, not
 * these headers. Static Assets (`/_next/static/*`) never hit this Worker.
 */
function applyDocumentBrowserCacheHeaders(response: Response): Response {
  if (!contentTypeIsHtmlOrRsc(response.headers.get("content-type"))) {
    return response;
  }

  const existing = response.headers.get("Cache-Control") ?? "";
  if (existing && cacheControlAlreadyBrowserRevalidate(existing)) {
    return response;
  }

  const headers = new Headers(response.headers);
  const sMaxAge = readDirectiveSeconds(existing, "s-maxage");
  if (sMaxAge != null) {
    // Cloudflare OCC only honors public | s-maxage | must-revalidate on this header.
    headers.set(
      "Cloudflare-CDN-Cache-Control",
      `public, s-maxage=${sMaxAge}`
    );
    const swr = readDirectiveSeconds(existing, "stale-while-revalidate");
    headers.set(
      "CDN-Cache-Control",
      swr != null
        ? `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`
        : `public, s-maxage=${sMaxAge}`
    );
  }

  headers.set("Cache-Control", BROWSER_DOCUMENT_CACHE_CONTROL);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const response = await handler.fetch(request, env, ctx);
    return applyDocumentBrowserCacheHeaders(response);
  },
} satisfies ExportedHandler<CloudflareEnv>;

// Required when using DO queue + DO sharded tag cache (see open-next.config.ts).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- @ts-expect-error breaks when .open-next/worker.js already exists locally
// @ts-ignore OpenNext generates `./.open-next/worker.js` after the pre-build TypeScript pass
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
