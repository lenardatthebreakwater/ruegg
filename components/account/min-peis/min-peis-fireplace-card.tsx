import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MinPeisSummary } from "@/lib/account/min-peis-types";

type MinPeisFireplaceCardProps = {
  fireplace: MinPeisSummary;
};

export function MinPeisFireplaceCard({ fireplace }: MinPeisFireplaceCardProps) {
  const href = `/min-konto/min-peis/${encodeURIComponent(fireplace.slug)}/`;
  const alt = fireplace.image?.altText || fireplace.name;

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-xl border border-border/80 bg-card p-3 shadow-xs ring-1 ring-foreground/5 transition-colors hover:border-primary/35 hover:bg-primary/[0.03] sm:p-4"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
        {fireplace.image?.sourceUrl ? (
          <Image
            src={fireplace.image.sourceUrl}
            alt={alt}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {fireplace.brand ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {fireplace.brand}
          </p>
        ) : null}
        <p className="text-base font-medium leading-snug text-foreground group-hover:text-primary">
          {fireplace.name}
        </p>
        <p className="text-sm text-muted-foreground">
          Din peis siden {fireplace.ownedSinceYear}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground">
          Se peisen din
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
