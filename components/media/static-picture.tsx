import * as React from "react";

import { cn } from "@/lib/utils";

type StaticPictureProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt"
> & {
  /**
   * Extensionless public path, e.g. `/images/homepage/hero-day`,
   * or a path that still includes `.webp`/`.avif` (extension stripped).
   * SVG paths (`.svg`) render as a plain `<img>` without picture/avif/webp.
   */
  src: string;
  alt: string;
  /** Prefer AVIF then WebP. Set false only for rare OG/disk readers. */
  preferAvif?: boolean;
};

function isSvgSrc(src: string): boolean {
  return /\.svg$/i.test(src);
}

/** Strip a trailing raster extension so we can append `.avif` / `.webp`. */
export function staticImageBase(src: string): string {
  return src.replace(/\.(avif|webp|jpe?g|png)$/i, "");
}

/**
 * Local marketing images: Tinify AVIF + WebP pair under `public/`.
 * Use for storefront chrome; remote Woo URLs should use a plain `<img>`.
 * SVG sources skip the picture element and render a single `<img>`.
 */
export function StaticPicture({
  src,
  alt,
  className,
  preferAvif = true,
  ...imgProps
}: StaticPictureProps) {
  if (isSvgSrc(src)) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- SVG has no avif/webp pair */
      <img src={src} alt={alt} className={cn(className)} {...imgProps} />
    );
  }

  const base = staticImageBase(src);
  const avif = `${base}.avif`;
  const webp = `${base}.webp`;

  return (
    <picture className={cn(className)}>
      {preferAvif ? <source srcSet={avif} type="image/avif" /> : null}
      <source srcSet={webp} type="image/webp" />
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional static Tinify pair */}
      <img src={webp} alt={alt} className={className} {...imgProps} />
    </picture>
  );
}

/** CSS `image-set()` for background-image (navbar tiles, location bands). SVG returns a single url(). */
export function staticImageSet(src: string): string {
  if (isSvgSrc(src)) {
    return `url("${src}")`;
  }
  const base = staticImageBase(src);
  return `image-set(url("${base}.avif") type("image/avif"), url("${base}.webp") type("image/webp"))`;
}
