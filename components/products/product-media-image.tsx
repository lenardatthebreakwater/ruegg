"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductMediaImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** First/LCP image only — never set on dense catalog grids. */
  priority?: boolean;
  /** object-cover (default) or object-contain */
  fit?: "cover" | "contain";
  draggable?: boolean;
};

/**
 * Shared next/image wrapper for product/catalog media.
 * Parent must be `relative` with an intrinsic size (e.g. aspect-square).
 * Lazy by default; only the active LCP/PDP hero should pass `priority`.
 */
export function ProductMediaImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  fit = "cover",
  draggable = false,
}: ProductMediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={draggable}
      onError={() => setFailed(true)}
      className={cn(
        "select-none",
        fit === "contain" ? "object-contain" : "object-cover",
        className
      )}
    />
  );
}
