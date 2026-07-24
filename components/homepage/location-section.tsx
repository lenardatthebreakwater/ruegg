"use client";

import { motion } from "motion/react";
import { ExternalLinkIcon, MapPin, Store } from "lucide-react";
import { staticImageSet } from "@/components/media/static-picture";
import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { LocationMapEmbed } from "@/components/homepage/location-map-embed";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import type { LocationInfo } from "@/lib/data/homepage";
import { PAGE_SECTION_PY, SECTION_INTRO_BLOCK_MARGIN, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const DEFAULT_BACKGROUND = "/images/homepage/location/showroom-baerum.webp";

function mapsEmbedSrc(location: LocationInfo): string {
  if (location.mapsEmbedUrl) return location.mapsEmbedUrl;
  const q = encodeURIComponent(`${location.name}, ${location.address}`);
  return `https://maps.google.com/maps?q=${q}&hl=no&z=15&output=embed`;
}

function mapsPlaceHref(location: LocationInfo): string {
  if (location.mapsPlaceUrl) return location.mapsPlaceUrl;
  const q = encodeURIComponent(`${location.name}, ${location.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

type LocationSectionProps = {
  location: LocationInfo;
  introTitle?: string;
  introDescription?: string;
  introAlign?: SectionIntroAlign;
};

export function LocationSection({
  location,
  introTitle = "Besøk oss",
  introDescription =
    "Velkommen innom showroom på Harestua for en hyggelig peisprat.",
  introAlign = "center",
}: LocationSectionProps) {
  const backgroundSrc =
    location.backgroundImageUrl?.trim() || DEFAULT_BACKGROUND;
  const embedSrc = mapsEmbedSrc(location);
  const mapsPlaceLink = mapsPlaceHref(location);

  return (
    <section
      id="visit-us"
      className="relative isolate overflow-hidden border-b border-border"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: staticImageSet(backgroundSrc) }}
      >
        <div className="absolute inset-0 bg-neutral-950/60" />
      </div>

      <ContainedLayout
        as="div"
        className={cn("relative z-10", PAGE_SECTION_PY)}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={SECTION_INTRO_BLOCK_MARGIN}
        >
          <SectionIntro
            title={introTitle}
            description={introDescription}
            align={introAlign}
            titleClassName="text-white"
            descriptionClassName="text-neutral-200"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.95, ease: "easeOut", delay: 0.08 }}
          className={cn("grid items-stretch lg:grid-cols-2", HOME_PAGE_GRID_GAP)}
        >
          <div
            className="flex flex-col justify-center rounded-2xl border border-neutral-200/70 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/55 sm:p-10"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3">
                <IconBadge icon={Store} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    Showroom
                  </p>
                  <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {location.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200/80 pt-6 dark:border-white/10">
                <IconBadge icon={MapPin} />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Adresse
                  </p>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-300">
                    {location.address}
                  </p>
                </div>
              </div>

              {location.description ? (
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {location.description}
                </p>
              ) : null}

              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 sm:w-auto"
                >
                  <a
                    href={mapsPlaceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Besøk oss
                    <ExternalLinkIcon
                      className="size-4"
                      data-icon="inline-end"
                      aria-hidden
                    />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <LocationMapEmbed embedSrc={embedSrc} mapsPlaceHref={mapsPlaceLink} />
        </motion.div>
      </ContainedLayout>
    </section>
  );
}
