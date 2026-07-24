# Next.js on Cloudflare Workers — starter kit

Everything learned deploying christianiakakkelovner.no, packaged for the
next project. Copy this folder's contents into a new Next.js repo and
follow the checklist. Read `DEPLOYMENT.md` (in this folder) for the full
war stories behind each rule.

## What's in the kit

| File | Copy to | Notes |
|---|---|---|
| `DEPLOYMENT.md` | `docs/DEPLOYMENT.md` | The playbook. Read it first. |
| `wrangler.template.jsonc` | `wrangler.jsonc` | Search for CHANGE/MY- placeholders |
| `open-next.config.ts` | project root | As-is. Required for prerendered/MDX pages |
| `.gitattributes` | project root | Keeps `*.sh` LF so bash in WSL works |
| `gitignore-additions.txt` | append to `.gitignore` | Then delete the txt |
| `AGENTS.template.md` | `AGENTS.md` (or append) | Project rules for AI agents |
| `scripts/wsl-setup.sh` | `scripts/` | One-time: nvm + Node inside WSL |
| `scripts/wsl-deploy.sh` | `scripts/` | Routine deploys; auto-derives build dir from folder name |
| `scripts/convert-to-avif.mjs` | `scripts/` | Tinify API: converts `public/images/**` png/jpg/webp to AVIF |
| `scripts/generate-og-image.mjs` | `scripts/` | Static OG image; EDIT paths/branding per project |

## package.json scripts to merge

```json
{
  "scripts": {
    "build": "next build --webpack",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "deploy:wsl": "wsl -e bash scripts/wsl-deploy.sh"
  }
}
```

(If the project uses Velite or another content build step, prefix `build`
with it, e.g. `velite && next build --webpack`.)

## Setup checklist for a new project

1. `npm i -D @opennextjs/cloudflare@latest wrangler@latest`
2. Copy the files per the table above; fix placeholders in `wrangler.jsonc`.
3. Build script MUST use `--webpack` (Turbopack breaks at runtime on
   Workers — DEPLOYMENT.md issue #1). Re-test Turbopack on new adapter
   versions; it may be fixed by now.
4. No `opengraph-image.tsx` / `ImageResponse` — static PNG instead
   (issue #3).
5. Set `NEXT_PUBLIC_SITE_URL` to the production domain in `.env.local`
   BEFORE building — it is inlined at build time.
6. WSL one-time setup (only if this machine hasn't done it before —
   already done on MANTAB):
   - `wsl -e bash scripts/wsl-setup.sh`
   - wrangler auth: `npx wrangler login` inside WSL, or copy
     `%APPDATA%\xdg.config\.wrangler\config\default.toml` to WSL
     `~/.config/.wrangler/config/default.toml`
7. First deploy: `npm run deploy:wsl` → smoke test the workers.dev URL.
8. Secrets: `echo <value> | npx wrangler secret put NAME` (run in WSL).
9. Domain cutover LAST: delete old A/AAAA/CNAME for `@`/`www` in the
   dashboard (keep MX/TXT!), uncomment `routes` in `wrangler.jsonc`,
   redeploy (issue #4).
10. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Image workflow

- User-supplied AVIF = already optimized, use as-is.
- Everything else raster → `TINIFY_API_KEY=<key> node scripts/convert-to-avif.mjs`
  (converts everything under `public/images/`, writes `.avif` alongside).
- Keep as PNG: favicons, `opengraph-image.png`, `logo.png` (social
  scrapers and favicon handling don't do AVIF).
- SEO: descriptive hyphenated filenames + specific alt text on every image.
- Sitemap: include per-page image entries (`images` array in
  `app/sitemap.ts` entries) and honest `lastmod` dates — see this repo's
  `app/sitemap.ts` for the pattern.

## Reference implementations (look at the source repo, not the kit)

- `app/sitemap.ts` — image sitemap + honest lastmod pattern
- `lib/seo.ts` — Organization/WebSite/Breadcrumb/Article JSON-LD helpers
- `app/actions/contact.ts` — contact form: D1 native binding (prod) with
  HTTP-API and NDJSON fallbacks (dev), Brevo transactional email
- `next.config.mjs` — 301 redirect matrix from an old site + allowedDevOrigins
