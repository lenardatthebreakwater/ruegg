import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

/**
 * Crawl rules for the same-host Next + WordPress storefront.
 * Aligned with Workers Route exclusions in docs/runbooks/domain-cutover-checklist.md.
 * Intentionally does not disallow /wp-content/ (uploads / product media).
 */
const DISALLOW: string[] = [
  // Account + Next API
  "/min-konto/",
  "/api/",

  // Commerce / checkout / payments (WordPress)
  "/checkout",
  "/checkout/",
  "/wc-api/",
  "/vipps-betaling",
  "/vipps-betaling/",
  "/vipps-express-checkout",
  "/vipps-express-checkout/",
  "/vipps-buy-product",
  "/vipps-buy-product/",

  // Cart redirects (thin; 301 elsewhere)
  "/cart/",
  "/handlekurv/",

  // WordPress admin / APIs / noise (not storefront content)
  "/wp-admin/",
  "/wp-login.php",
  "/wp-json/",
  "/wp-includes/",
  "/wp-cron.php",
  "/xmlrpc.php",
  "/index.php",
  "/graphql",
  "/graphql/",

  // Tagging + Apple Pay association (not indexable content)
  "/cartdata/",
  "/.well-known/",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl,
  };
}
