"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StaticPicture } from "@/components/media/static-picture";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PopulaereSokHub } from "@/lib/populaere-sok/types";

type PopulaereSokHubCardProps = {
  hub: PopulaereSokHub;
  className?: string;
};

export function PopulaereSokHubCard({ hub, className }: PopulaereSokHubCardProps) {
  const { path, menuTitle, menuImageSrc, menuImageAlt, ctaLabel } = hub;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-900 shadow-sm transition-all duration-200 ease-out select-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md dark:bg-card dark:text-card-foreground",
        className
      )}
    >
      <Link
        href={path}
        className="flex min-h-0 flex-1 flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={menuTitle}
      >
        <div className="relative aspect-square shrink-0 bg-white dark:bg-white">
          <StaticPicture
            src={menuImageSrc}
            alt={menuImageAlt}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <h2 className="line-clamp-4 font-medium leading-tight">{menuTitle}</h2>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <Button variant="default" className="w-full" asChild>
          <Link href={path}>
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
