import { ContainedLayout } from "@/components/layout/contained-layout";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type CampaignHostedVideoSectionProps = {
  /** Path under /public, e.g. `/videos/campaigns/foo/bar.mp4` */
  src: string;
  /** Accessible name (visually hidden heading). */
  title: string;
  className?: string;
};

export function CampaignHostedVideoSection({
  src,
  title,
  className,
}: CampaignHostedVideoSectionProps) {
  return (
    <section
      className={cn("border-b border-border", PAGE_SECTION_PY, className)}
      aria-label={title}
    >
      <ContainedLayout>
        <h2 className="sr-only">{title}</h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-black shadow-sm dark:border-white/10">
          <video
            className="aspect-video w-full object-cover"
            src={src}
            controls
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </ContainedLayout>
    </section>
  );
}
