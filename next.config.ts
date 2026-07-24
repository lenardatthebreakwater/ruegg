import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { legacyRankMathRedirects } from "./lib/redirects/legacy-rankmath-redirects";

/** Default contact max file size (10 MiB) × 1.25 for multipart boundaries; must be `number` for Next `SizeLimit` typing. */
const CONTACT_POST_BODY_BYTES = Math.ceil(10 * 1024 * 1024 * 1.25);

const nextConfig: NextConfig = {
  trailingSlash: true,
  /**
   * Next.js 16 blocks cross-origin requests to /_next/* in development by default.
   * Without this, opening the site via LAN hostname (phone/laptop → mantab:3000)
   * loads a shell with most JS/CSS chunks blocked, so content appears missing.
   */
  allowedDevOrigins: ["127.0.0.1", "mantab", "mantab.local"],
  /** Keep the Next.js Dev Tools badge in the bottom-left (away from our FAB cluster). */
  devIndicators: {
    position: "bottom-left",
  },
  /**
   * Local builds prerender the full catalog + every PDP (thousands of
   * WordPress GraphQL round-trips). Allow a long wall clock; cost is on the
   * build machine, not Cloudflare Workers.
   */
  staticPageGenerationTimeout: 3600,
  experimental: {
    /**
     * OpenNext on Cloudflare: multipart contact uploads > ~1 MiB can fail or stall without this
     * (see opennextjs-cloudflare #654). Local `next dev` often still works without it.
     */
    serverActions: {
      bodySizeLimit: CONTACT_POST_BODY_BYTES,
    },
    /**
     * When Next clones request bodies for proxy/route handling, cap must cover full multipart size.
     * Default 10 MiB is borderline vs 10 MiB files plus boundaries; bump slightly.
     */
    proxyClientMaxBodySize: CONTACT_POST_BODY_BYTES,
    /**
     * Full-catalog PDP prerender hammers WordPress GraphQL. Cap concurrency and
     * retry failed pages so one transient 500 does not abort the whole build.
     */
    staticGenerationMaxConcurrency: 2,
    staticGenerationRetryCount: 3,
  },
  images: {
    /**
     * Serve originals directly — no `/_next/image` → Cloudflare Images transforms.
     * Marketing assets are Tinify AVIF/WebP; product media comes from WP. Runtime
     * CF Images burned the free 5k unique-transform quota and returned 9422/500s.
     */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "peisbutikken.no",
      },
      // Fallback if WordPress media ever moves off the apex (same-domain plan
      // keeps /wp-content on peisbutikken.no; harmless to allow).
      {
        protocol: "https",
        hostname: "store.peisbutikken.no",
      },
    ],
  },
  async headers() {
    const longCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];
    return [
      {
        source: "/images/:path*",
        headers: longCache,
      },
      {
        source: "/videos/:path*",
        headers: longCache,
      },
      {
        source: "/peisbutikken-logo-on-light.webp",
        headers: longCache,
      },
      {
        source: "/peisbutikken-logo-on-light.avif",
        headers: longCache,
      },
      {
        source: "/peisbutikken-logo-on-dark.webp",
        headers: longCache,
      },
      {
        source: "/peisbutikken-logo-on-dark.avif",
        headers: longCache,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/black-friday-peis-vedovn-2024",
        destination: "/",
        permanent: true,
      },
      {
        source: "/black-friday-peis-vedovn-2024/",
        destination: "/",
        permanent: true,
      },
      // Removed Peisbutikken hubs / campaigns → home (fork not live; keep crawlable).
      {
        source: "/black-friday-kampanje-2024",
        destination: "/",
        permanent: true,
      },
      {
        source: "/black-friday-kampanje-2024/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/black-friday-kampanje-2025",
        destination: "/",
        permanent: true,
      },
      {
        source: "/black-friday-kampanje-2025/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/tilbud",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/tilbud/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/lagersalg",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/lagersalg/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/ombyggingssalg",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/ombyggingssalg/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/populaere-sok",
        destination: "/",
        permanent: true,
      },
      {
        source: "/populaere-sok/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/populaere-sok/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/nordpeis-kampanje-unike-tilbud",
        destination: "/",
        permanent: true,
      },
      {
        source: "/nordpeis-kampanje-unike-tilbud/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/eklsusive-kampanjetilbud-pa-aduro-hybridovner",
        destination: "/",
        permanent: true,
      },
      {
        source: "/eklsusive-kampanjetilbud-pa-aduro-hybridovner/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/eklsusive-kampanjetilbud-pa-aduro-vedovner",
        destination: "/",
        permanent: true,
      },
      {
        source: "/eklsusive-kampanjetilbud-pa-aduro-vedovner/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/oranier-pureblack",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/oranier-pureblack/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/usedom-5-kampanje-med-montering",
        destination: "/",
        permanent: true,
      },
      {
        source: "/usedom-5-kampanje-med-montering/",
        destination: "/",
        permanent: true,
      },
      // Former popular-search hub landings
      {
        source: "/peis",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/peis/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/peisovn",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/peisovn/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/peisinnsats",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/peisinnsats/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/vedovn",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/vedovn/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/utepeis",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/utepeis/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/stalpipe",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/stalpipe/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/aduro",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/aduro/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/dovre-peis",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/dovre-peis/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/element4",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/element4/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/hajduk",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/hajduk/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/nordpeis",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/nordpeis/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/sitemap_index.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      // Old WP/RankMath child sitemaps (post-sitemap.xml, product-sitemap14.xml,
      // pa_aduro-deler-sitemap.xml, wp-sitemap.xml, …) → Next sitemap index.
      // Regex requires a "<prefix>-sitemap" stem so /sitemap.xml itself never
      // matches (would loop).
      {
        source: "/:sitemap([\\w-]+-sitemap\\d*\\.xml)",
        destination: "/sitemap.xml",
        permanent: true,
      },
      // Legacy WP pagination — no Next equivalents; Google still crawls these.
      {
        source: "/page/:page(\\d+)",
        destination: "/",
        permanent: true,
      },
      {
        source: "/page/:page(\\d+)/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/shop/page/:page(\\d+)",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/shop/page/:page(\\d+)/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/blog/page/:page(\\d+)",
        destination: "/blog/",
        permanent: true,
      },
      {
        source: "/blog/page/:page(\\d+)/",
        destination: "/blog/",
        permanent: true,
      },
      {
        source: "/merke/:slug/page/:page(\\d+)",
        destination: "/brand/:slug/",
        permanent: true,
      },
      {
        source: "/merke/:slug/page/:page(\\d+)/",
        destination: "/brand/:slug/",
        permanent: true,
      },
      {
        source: "/lokalmontering",
        destination: "/category/peismontering/",
        permanent: true,
      },
      {
        source: "/lokalmontering/:path*",
        destination: "/category/peismontering/",
        permanent: true,
      },
      // Old WordPress category pagination (/produktkategori/x/page/2/) —
      // must be matched before the generic nested-category redirect below.
      {
        source: "/produktkategori/:category/page/:page",
        destination: "/produktkategori/:category/",
        permanent: true,
      },
      // WordPress served hierarchical category URLs (e.g.
      // /produktkategori/peistilbehor/brannmur/); Next.js uses flat slugs, so
      // redirect any nested path to its last segment.
      {
        source: "/produktkategori/:parents+/:category",
        destination: "/produktkategori/:category/",
        permanent: true,
      },
      // Legacy Rank Math / WP brand URLs (`/merke/*` → `/brand/*`).
      // No brand index page exists; bare `/merke` goes to the shop catalog.
      {
        source: "/merke",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/merke/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/merke/:slug",
        destination: "/brand/:slug/",
        permanent: true,
      },
      {
        source: "/merke/:slug/",
        destination: "/brand/:slug/",
        permanent: true,
      },
      // Seasonal campaign landing — offers hub removed; send to shop.
      {
        source: "/varkampanje",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/varkampanje/",
        destination: "/shop/",
        permanent: true,
      },
      // Legacy Woo cart URLs (side cart is Next-only; no cart page).
      {
        source: "/cart",
        destination: "/",
        permanent: true,
      },
      {
        source: "/cart/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/cart/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/handlekurv",
        destination: "/",
        permanent: true,
      },
      {
        source: "/handlekurv/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/handlekurv/:path*",
        destination: "/",
        permanent: true,
      },
      // Legacy WP My Account → Next Min konto.
      {
        source: "/my-account",
        destination: "/min-konto/",
        permanent: true,
      },
      {
        source: "/my-account/",
        destination: "/min-konto/",
        permanent: true,
      },
      {
        source: "/my-account/:path*",
        destination: "/min-konto/",
        permanent: true,
      },
      // Legacy WP category archives for editorial blog topics → /blog/ filter.
      {
        source: "/category/inspirasjon",
        destination: "/blog/?kategori=inspirasjon",
        permanent: true,
      },
      {
        source: "/category/inspirasjon/",
        destination: "/blog/?kategori=inspirasjon",
        permanent: true,
      },
      {
        source: "/category/nyheter",
        destination: "/blog/?kategori=nyheter",
        permanent: true,
      },
      {
        source: "/category/nyheter/",
        destination: "/blog/?kategori=nyheter",
        permanent: true,
      },
      {
        source: "/category/tips-og-rad",
        destination: "/blog/?kategori=tips-og-rad",
        permanent: true,
      },
      {
        source: "/category/tips-og-rad/",
        destination: "/blog/?kategori=tips-og-rad",
        permanent: true,
      },
      // --- Ported RankMath redirects (WP-side redirects die at cutover) ---
      // Specific slug renames/exceptions first (generated file), then the
      // generic patterns that replace 900+ one-to-one export rows. Sources use
      // trailing slashes only: trailingSlash:true 301s slash-less non-file
      // requests before custom redirects run. Regenerate the data file with
      // scripts/generate-legacy-redirects.mjs after each RankMath re-export.
      ...legacyRankMathRedirects,
      // Old Shopify language prefixes.
      {
        source: "/en/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/pl/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/pl/:path*/",
        destination: "/",
        permanent: true,
      },
      // Old Shopify catalog URLs — slugs were carried over 1:1 to WooCommerce.
      {
        source: "/collections/:collection/products/:slug/",
        destination: "/produkt/:slug/",
        permanent: true,
      },
      {
        source: "/products/:slug/",
        destination: "/produkt/:slug/",
        permanent: true,
      },
      {
        source: "/product/:slug/",
        destination: "/produkt/:slug/",
        permanent: true,
      },
      {
        source: "/brands/:slug/",
        destination: "/brand/:slug/",
        permanent: true,
      },
      {
        source: "/brand/:slug/page/:page(\\d+)/",
        destination: "/brand/:slug/",
        permanent: true,
      },
      {
        source: "/collections/peiser/",
        destination: "/produktkategori/peisovn/",
        permanent: true,
      },
      {
        source: "/collections/peiser/:path*/",
        destination: "/produktkategori/peisovn/",
        permanent: true,
      },
      // Any other Shopify catalog URL → shop landing (they 404 on WP today;
      // a redirect is strictly better).
      {
        source: "/products/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/collections/",
        destination: "/shop/",
        permanent: true,
      },
      {
        source: "/collections/:path*/",
        destination: "/shop/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/peismontering-i-:place",
        destination: "/lokalmontering/peismontering-i-:place",
      },
      {
        source: "/peismontering-i-:place/",
        destination: "/lokalmontering/peismontering-i-:place/",
      },
      {
        source: "/peismontering-pa-:place",
        destination: "/lokalmontering/peismontering-pa-:place",
      },
      {
        source: "/peismontering-pa-:place/",
        destination: "/lokalmontering/peismontering-pa-:place/",
      },
    ];
  },
};

export default nextConfig;

// Only run in dev so `next build` (e.g. on Cloudflare) does not touch Wrangler
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
