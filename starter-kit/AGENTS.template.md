# Project rules

## Git: never commit to main

NEVER commit or push to `main` unless the user explicitly says so. `main`
may trigger an automatic production deploy. Commit work to a feature
branch instead, and let the user decide when/how it reaches `main`.

## Images

- Images supplied by the user as **AVIF** are already optimized — use them
  as-is, do NOT re-run them through Tinify.
- Images in any other raster format (png/jpg/webp) must be converted to
  AVIF via the TinyPNG API before use (see `scripts/convert-to-avif.mjs`;
  requires `TINIFY_API_KEY` env var).
- Keep favicons (`app/icon.png`, `app/apple-icon.png`),
  `public/opengraph-image.png` and `public/logo.png` as PNG — social
  scrapers and favicon handling don't support AVIF.
- Image filenames must be SEO-friendly and descriptive (lowercase,
  hyphenated, Norwegian keywords where relevant). Every image needs an
  accurate, specific alt text.

## SEO

- Every page's sitemap `lastmod` must be honest: bump the `updated`
  frontmatter field (content pages) or the date map in `app/sitemap.ts`
  (static routes) when page content meaningfully changes.

## Build & deploy

- Deploy with `npm run deploy:wsl` (builds on Linux inside WSL).
- Build with webpack, not Turbopack (`next build --webpack`) — see
  DEPLOYMENT.md for why.
- No dynamic OG images (`opengraph-image.tsx`) — generate a static PNG
  with `scripts/generate-og-image.mjs`.
