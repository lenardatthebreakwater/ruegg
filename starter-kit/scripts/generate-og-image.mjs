/**
 * Generates static brand assets:
 *  - public/opengraph-image.png (1200x630) — photo + dark gradient + logo
 *  - public/logo.png — white wordmark on brand-dark background (for JSON-LD)
 *
 * Run with: node scripts/generate-og-image.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const photoPath = path.join(
  root,
  "public/images/kakkelovn-hvit-klassisk-salong.avif",
);
const logoPath = path.join(root, "public/logo-white.svg");

const WIDTH = 1200;
const HEIGHT = 630;

// Bottom gradient so the logo stays readable on any monitor.
const gradient = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#14100c" stop-opacity="0"/>
      <stop offset="1" stop-color="#14100c" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
</svg>`);

const logoSvg = await readFile(logoPath);
const logoWidth = 620;
const logo = await sharp(logoSvg).resize({ width: logoWidth }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();

await sharp(photoPath)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
  .composite([
    { input: gradient, top: 0, left: 0 },
    {
      input: logo,
      top: HEIGHT - 56 - logoMeta.height,
      left: 56,
    },
  ])
  .png()
  .toFile(path.join(root, "public/opengraph-image.png"));

console.log("public/opengraph-image.png written");

// Brand-dark background matching the Christiania dark theme.
const LOGO_W = 1200;
const LOGO_H = 600;
const logoOnDark = await sharp(logoSvg)
  .resize({ width: 1000 })
  .png()
  .toBuffer();
const logoOnDarkMeta = await sharp(logoOnDark).metadata();

await sharp({
  create: {
    width: LOGO_W,
    height: LOGO_H,
    channels: 4,
    background: { r: 36, g: 31, b: 27, alpha: 1 },
  },
})
  .composite([
    {
      input: logoOnDark,
      top: Math.round((LOGO_H - logoOnDarkMeta.height) / 2),
      left: Math.round((LOGO_W - logoOnDarkMeta.width) / 2),
    },
  ])
  .png()
  .toFile(path.join(root, "public/logo.png"));

console.log("public/logo.png written");
