import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // OpenNext / Wrangler generated output (not source)
    ".open-next/**",
    // Local dry-run / tool scratch (gitignored; still present on disk)
    "tmp/**",
    // Generated Cloudflare binding types (huge; not hand-maintained)
    "cloudflare-env.d.ts",
    // Bundled Worker entry (not app TypeScript source)
    "workers/**/*.js",
    // Node CJS require stubs for local scripts
    "scripts/**/*.cjs",
  ]),
]);

export default eslintConfig;
