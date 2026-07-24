import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type CampaignWideImageSectionProps = {
  src: string;
  alt: string;
  className?: string;
};

export function CampaignWideImageSection({ src, alt, className }: CampaignWideImageSectionProps) {
  return (
    <section className={cn("border-b border-border", PAGE_SECTION_PY, className)}>
      <ContainedLayout>
        <div className="relative aspect-square w-full max-h-[min(90vh,56rem)] overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm dark:border-white/10 sm:aspect-[4/3] lg:aspect-[16/10]">
          <StaticPicture
            src={src}
            alt={alt}
            className="absolute inset-0 size-full object-cover object-center"
          />
        </div>
      </ContainedLayout>
    </section>
  );
}
