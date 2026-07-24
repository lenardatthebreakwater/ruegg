"use client";

import { useRef, useState } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMountEffect } from "@/lib/hooks/effect-last";

type LocationMapEmbedProps = {
  embedSrc: string;
  mapsPlaceHref: string;
};

/**
 * Defers the Google Maps iframe until the map is near the viewport (or the
 * user clicks). Avoids pulling Maps Utility JS on first paint / Lighthouse.
 */
export function LocationMapEmbed({
  embedSrc,
  mapsPlaceHref,
}: LocationMapEmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useMountEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  });

  return (
    <div
      ref={hostRef}
      className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl ring-1 ring-white/10 backdrop-blur-sm sm:min-h-[340px] lg:h-full lg:min-h-[360px]"
    >
      {active ? (
        <iframe
          title="Kart — Rüegg"
          src={embedSrc}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/40 p-6 text-center">
          <MapPin className="size-8 text-white/80" aria-hidden />
          <p className="text-sm text-neutral-100">Vis kart over showroomet</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="bg-white text-neutral-900 hover:bg-white/90"
              onClick={() => setActive(true)}
            >
              Last inn kart
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href={mapsPlaceHref} target="_blank" rel="noopener noreferrer">
                Åpne i Google Maps
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
