import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type CampaignFigureSectionProps = {
  src: string;
  alt: string;
  className?: string;
};

export function CampaignFigureSection({ src, alt, className }: CampaignFigureSectionProps) {
  return (
    <section className={cn("border-b border-border", PAGE_SECTION_PY, className)}>
      <ContainedLayout>
        <figure className="relative w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-muted/30 shadow-sm dark:border-white/10">
          <div className="relative aspect-[16/9] w-full">
            <StaticPicture
              src={src}
              alt={alt}
              className="absolute inset-0 size-full object-contain object-center"
            />
          </div>
        </figure>
      </ContainedLayout>
    </section>
  );
}
