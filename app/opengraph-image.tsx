import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export const alt = "Rüegg";

export const size = {
  width: 1200,
  height: 630,
};

/**
 * ImageResponse / Satori always rasterizes to PNG. WebP/AVIF embeds crash
 * prerender (`TypeError: … is not iterable`). Keep a PNG/JPEG on disk for
 * the photo; otherwise use the brand gradient fallback.
 *
 * Scope reads under `public/images/opengraph` and mark `process.cwd()` with
 * turbopackIgnore so NFT tracing does not pull in the whole project.
 */
export const contentType = "image/png";

const HERO_CANDIDATES = [
  "home-hero-og.png",
  "home-hero-og.jpg",
  "home-hero-og.jpeg",
] as const;

async function loadHeroImageDataUri(): Promise<string | null> {
  const ogDir = join(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "images",
    "opengraph"
  );

  for (const fileName of HERO_CANDIDATES) {
    try {
      const bytes = await readFile(join(ogDir, fileName));
      const mime = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export default async function OpenGraphImage() {
  const heroImageDataUri = await loadHeroImageDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#111827",
        }}
      >
        {heroImageDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires raw <img>
          <img
            src={heroImageDataUri}
            alt="Stue med peis"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "72px 84px",
              color: "#f9fafb",
              background:
                "linear-gradient(135deg, #111827 0%, #1f2937 55%, #374151 100%)",
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                opacity: 0.9,
                marginBottom: 20,
              }}
            >
              Rüegg
            </div>
            <div
              style={{
                maxWidth: 820,
                fontSize: 64,
                lineHeight: 1.08,
                fontWeight: 700,
              }}
            >
              Premium peiser og vedovner
            </div>
          </div>
        )}
      </div>
    ),
    size
  );
}
