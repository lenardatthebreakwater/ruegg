import Image from "next/image";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import type { MinPeisDetail } from "@/lib/account/min-peis-types";

type MinPeisDetailHeaderProps = {
  fireplace: MinPeisDetail;
};

export function MinPeisDetailHeader({ fireplace }: MinPeisDetailHeaderProps) {
  return (
    <header className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white ring-1 ring-foreground/5 sm:aspect-[3/4] lg:aspect-auto lg:min-h-[28rem] dark:bg-white">
        {fireplace.image?.sourceUrl ? (
          <Image
            src={fireplace.image.sourceUrl}
            alt={fireplace.image.altText || fireplace.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-contain object-center p-4 sm:p-6"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/40" aria-hidden />
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 lg:py-2">
        <div className="space-y-2">
          <EditorialEyebrow>Din peis</EditorialEyebrow>
          {fireplace.brand ? (
            <p className="text-sm font-medium text-muted-foreground">
              {fireplace.brand}
            </p>
          ) : null}
          <EditorialHeading size="account">{fireplace.name}</EditorialHeading>
          <p className="text-sm text-muted-foreground">
            Din peis siden {fireplace.ownedSinceYear}
          </p>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Tilbehør, reservedeler, dokumenter og hjelp samlet for peisen din.
        </p>
      </div>
    </header>
  );
}
