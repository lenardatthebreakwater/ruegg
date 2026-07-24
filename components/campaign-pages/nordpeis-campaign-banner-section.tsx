import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { nordpeisKampanjeBanner } from "@/lib/data/hub-pages/nordpeis-kampanje";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/** Nordpeis campaign graphic between hero and contact — inset to page container. */
export function NordpeisCampaignBannerSection() {
  const { imageSrc, imageAlt, width, height } = nordpeisKampanjeBanner;

  return (
    <section
      className={cn("border-b border-border bg-muted/20", PAGE_SECTION_PY)}
      aria-label="Nordpeis-kampanje"
    >
      <ContainedLayout as="div">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
          <StaticPicture
            src={imageSrc}
            alt={imageAlt}
            width={width}
            height={height}
            className="h-auto w-full max-w-full object-cover object-center"
          />
        </div>
      </ContainedLayout>
    </section>
  );
}
