"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StaticPicture } from "@/components/media/static-picture";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import type { HubBrandTeaserContent } from "@/lib/data/hub-pages/types";
import { cn } from "@/lib/utils";

type HubBrandTeaserCardProps = {
  teaser: HubBrandTeaserContent;
  className?: string;
  imageAspectClass?: string;
};

export function HubBrandTeaserCard({
  teaser,
  className,
  imageAspectClass = "aspect-square",
}: HubBrandTeaserCardProps) {
  const {
    title,
    description,
    ctaLabel,
    href,
    imageSrc,
    imageAlt,
    imageObjectFit = "contain",
    imageClassName,
    imageLayout = "fill",
  } = teaser;

  const isCompactImage = imageAspectClass !== "aspect-square";
  const useHeightFitLayout =
    imageLayout === "height-fit" && isCompactImage && imageObjectFit === "contain";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-900 shadow-sm transition-all duration-200 ease-out select-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md dark:bg-card dark:text-card-foreground",
        className
      )}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${title}: ${ctaLabel}`}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden",
            imageAspectClass,
            isCompactImage && imageObjectFit === "contain" && useHeightFitLayout
              ? "flex items-center justify-center"
              : undefined,
            imageObjectFit === "cover"
              ? "bg-neutral-100 dark:bg-neutral-950"
              : "bg-white dark:bg-white"
          )}
        >
          {useHeightFitLayout ? (
            <StaticPicture
              src={imageSrc}
              alt={imageAlt}
              className={cn(
                "h-auto w-[88%] max-w-[94%] object-contain object-center",
                imageClassName
              )}
            />
          ) : (
            <StaticPicture
              src={imageSrc}
              alt={imageAlt}
              className={cn(
                "absolute inset-0 size-full",
                imageObjectFit === "cover"
                  ? "object-cover object-center"
                  : isCompactImage
                    ? "object-contain p-2 sm:p-3"
                    : "object-contain p-6 sm:p-8",
                imageClassName
              )}
            />
          )}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <h3 className="font-medium leading-tight">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <Button variant="default" className="w-full" asChild>
          <Link href={href}>
            {ctaLabel}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
        </Button>
      </div>
      <BorderBeam
        borderWidth={2}
        duration={8}
        size={120}
        className="from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
      />
      <BorderBeam
        borderWidth={2}
        duration={8}
        delay={4}
        size={120}
        className="from-transparent via-destructive to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
      />
    </article>
  );
}
