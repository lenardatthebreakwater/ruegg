import { MapPin } from "lucide-react";
import { staticImageSet } from "@/components/media/static-picture";
import { IconBadge } from "@/components/ui/icon-badge";
import { ContainedLayout } from "@/components/layout/contained-layout";
import type { ServiceMapContent } from "@/lib/data/service-pages";
import type { LocationInfo } from "@/lib/data/homepage";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type ServiceMapSectionProps = {
  content: ServiceMapContent;
  location: LocationInfo;
};

function mapsEmbedSrc(location: LocationInfo): string {
  if (location.mapsEmbedUrl) return location.mapsEmbedUrl;
  const q = encodeURIComponent(`${location.name}, ${location.address}`);
  return `https://maps.google.com/maps?q=${q}&hl=no&z=15&output=embed`;
}

export function ServiceMapSection({ content, location }: ServiceMapSectionProps) {
  const embedSrc = mapsEmbedSrc(location);

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: location.backgroundImageUrl
            ? staticImageSet(location.backgroundImageUrl)
            : undefined,
        }}
      >
        <div className="absolute inset-0 bg-neutral-950/60" />
      </div>

      <ContainedLayout as="div" className={`relative z-10 ${PAGE_SECTION_PY}`}>
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/55 sm:p-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {content.title}
            </h2>
            <p className="mt-4 text-base text-neutral-700 dark:text-neutral-300">
              {content.description}
            </p>
            <p className="mt-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {content.areasHeading}
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {content.areas.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <IconBadge icon={MapPin} />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-neutral-700 dark:text-neutral-300">
              {content.closingText}
            </p>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl ring-1 ring-white/10 backdrop-blur-sm sm:min-h-[340px] lg:h-full lg:min-h-[360px]">
            <iframe
              title="Kart — Rüegg"
              src={embedSrc}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </ContainedLayout>
    </section>
  );
}
