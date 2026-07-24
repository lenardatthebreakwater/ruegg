# Archived homepage hero media

Former homepage hero stills and background loop video, kept in git for possible reuse.

## Why this path

OpenNext / Cloudflare Workers deploys static files from **`public/`** (copied into `.open-next/assets`, bound in `wrangler.jsonc` as `assets.directory`).

Anything under `assets/archive/` is **not** under `public/`, so it is **not** uploaded as Worker static assets and is **not** served in production.

Do **not** move these files back under `public/` unless they are intentionally part of the live UI again.

## Contents

| File | Former public path |
| --- | --- |
| `hero-fireplace-living-room.avif` | `/images/homepage/hero-fireplace-living-room.avif` |
| `hero-fireplace-living-room.webp` | `/images/homepage/hero-fireplace-living-room.webp` |
| `fireplace-living-room-loop.mp4` | `/videos/homepage/fireplace-living-room-loop.mp4` |

Live hero media (deployed): `public/images/homepage/hero-day.avif` and `hero-night.avif`.
