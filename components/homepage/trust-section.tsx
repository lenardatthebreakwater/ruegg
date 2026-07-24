"use client";

import {
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { IconBadge } from "@/components/ui/icon-badge";
import { MotionPreset } from "@/components/ui/motion-preset";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

export type TrustSectionItem = {
  iconKey: "star" | "truck" | "shieldCheck" | "mapPin" | "clock3" | "wrench";
  text: string;
};

const iconMap: Record<TrustSectionItem["iconKey"], LucideIcon> = {
  star: Star,
  truck: Truck,
  shieldCheck: ShieldCheck,
  mapPin: MapPin,
  clock3: Clock3,
  wrench: Wrench,
};

const defaultTrustItems: TrustSectionItem[] = [
  { iconKey: "star", text: "4.4 (116 anmeldelser)" },
  { iconKey: "truck", text: "Hjemlevering" },
  { iconKey: "wrench", text: "Montering" },
];

const trustIconSlotClasses =
  "flex h-11 w-full shrink-0 items-center justify-center";

const trustItemBoxClasses =
  "flex h-full min-h-0 flex-col items-center justify-start gap-1.5 px-0.5 py-4 text-center md:gap-3 md:px-5 md:py-6";

type TrustSectionProps = {
  items?: TrustSectionItem[];
  /** Service pages (e.g. montering): larger mobile icons + body text with wrap. */
  layout?: "default" | "service";
};

export function TrustSection({
  items = defaultTrustItems,
  layout = "default",
}: TrustSectionProps) {
  const isServiceLayout = layout === "service";

  return (
    <section
      aria-label="Tillit og fordeler"
      className={cn(
        "relative border-y border-neutral-200 dark:border-neutral-600",
        PAGE_SECTION_PY,
      )}
    >
      <ContainedLayout as="div">
        <MotionPreset
          fade
          blur
          delay={0.2}
          zoom={{ initialScale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <ul
            className={cn(
              "grid grid-cols-3 items-start md:grid-cols-2 md:gap-6 lg:grid-cols-3",
              isServiceLayout ? "gap-2 sm:gap-1" : "gap-1",
            )}
          >
            {items.map((item, index) => {
              const Icon = iconMap[item.iconKey];

              return (
                <li key={item.text} className="h-full w-full min-w-0">
                  <MotionPreset
                    className={cn(
                      trustItemBoxClasses,
                      isServiceLayout && "gap-2 py-3 sm:py-4 md:gap-3 md:py-6",
                    )}
                    fade
                    blur
                    zoom={{ initialScale: 0.95 }}
                    transition={{ duration: 0.55 }}
                    delay={0.35 + index * 0.12}
                  >
                    <div className={trustIconSlotClasses}>
                      <IconBadge
                        icon={Icon}
                        className="size-11 rounded-xl"
                        iconClassName="size-6"
                      />
                    </div>
                    <span
                      className={cn(
                        "w-full text-center md:font-medium md:leading-snug md:tracking-normal md:whitespace-normal",
                        isServiceLayout
                          ? "text-base font-normal leading-snug text-neutral-700 dark:text-neutral-300 md:text-xl"
                          : "text-sm font-medium leading-snug tracking-tight md:text-xl",
                      )}
                    >
                      {item.text}
                    </span>
                  </MotionPreset>
                </li>
              );
            })}
          </ul>
        </MotionPreset>
      </ContainedLayout>
    </section>
  );
}
