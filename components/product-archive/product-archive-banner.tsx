import Image from "next/image";
import {
  EditorialAccentPill,
  EditorialHeading,
} from "@/components/editorial";
import { cn } from "@/lib/utils";

type ProductArchiveBannerProps = {
  title: string;
  subtitle?: string;
  image?: {
    src: string;
    alt?: string;
  } | null;
  /**
   * `cover` (default) crops to fill — used by brand/category heroes.
   * `contain` shows the full image on a muted panel — reservedeler diagrams.
   */
  imageFit?: "cover" | "contain";
  className?: string;
};

export function ProductArchiveBanner({
  title,
  subtitle,
  image,
  imageFit = "cover",
  className,
}: ProductArchiveBannerProps) {
  const hasImage = Boolean(image?.src);
  const src = image?.src;
  const contain = imageFit === "contain";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-muted px-6 py-8 ring-1 ring-foreground/5 sm:px-8 sm:py-10 dark:ring-border",
        className
      )}
    >
      {hasImage && src && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={src}
            alt=""
            fill
            priority
            className="scale-105 object-cover opacity-40 blur-sm"
            sizes="(max-width: 768px) 100vw, 1120px"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/60" />
        </div>
      )}

      <div
        className={cn(
          "relative z-10",
          hasImage
            ? cn(
                "grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-14 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-24",
                contain ? "sm:items-center" : "sm:items-stretch"
              )
            : "flex flex-col gap-1"
        )}
      >
        <div
          className={cn(
            "min-w-0 flex flex-col text-left",
            hasImage
              ? "min-h-0 gap-2"
              : "gap-1"
          )}
        >
          <EditorialAccentPill className="mb-3" />
          <EditorialHeading size="page" className="shrink-0">
            {title}
          </EditorialHeading>
          {subtitle && (
            <p className="w-full min-w-0 text-left text-muted-foreground text-sm leading-relaxed sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {hasImage && src && (
          <div
            className={cn(
              "relative min-h-0 w-full min-w-0 overflow-hidden rounded-lg",
              // Contain: keep native reservedeler banner ratio (~8:5) so the full
              // diagram stays visible. Cover: fill text-row height on sm+; -my-2
              // equalizes image T/B inset with card right (px vs py, both ±0.5rem).
              contain
                ? "aspect-[8/5] bg-background"
                : "aspect-[3/2] sm:aspect-auto sm:-my-2 sm:h-[calc(100%+1rem)] sm:max-w-none"
            )}
          >
            <Image
              src={src}
              alt={image?.alt ?? title}
              fill
              priority
              fetchPriority="high"
              className={contain ? "object-contain" : "object-cover"}
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>
        )}
      </div>
    </div>
  );
}
