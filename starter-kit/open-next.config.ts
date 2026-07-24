import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// All pages are prerendered at build time (SSG). Serving the incremental
// cache from static assets means SSG pages (including the Velite MDX pages,
// which cannot be re-rendered on the Workers runtime because `new Function`
// is disallowed there) are always served from the build output.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
