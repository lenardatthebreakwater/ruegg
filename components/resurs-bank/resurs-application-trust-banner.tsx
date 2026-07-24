"use client";

import {
  BadgeCheck,
  ClipboardList,
  MessageCircle,
  MousePointerClick,
  SendHorizontal,
  type LucideIcon,
} from "lucide-react";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import { PAGE_COMPACT_BAND_PY } from "@/lib/page-rhythm";

const stepIcons: LucideIcon[] = [
  MousePointerClick,
  ClipboardList,
  SendHorizontal,
  MessageCircle,
  BadgeCheck,
];

type ResursApplicationTrustBannerProps = {
  steps: readonly string[];
  /** When true, skip outer section vertical padding (use inside a padded parent with gap like Fordeler). */
  embedded?: boolean;
};

export function ResursApplicationTrustBanner({
  steps,
  embedded = false,
}: ResursApplicationTrustBannerProps) {
  const inner = (
    <MotionPreset
      fade
      blur
      delay={embedded ? 0.08 : 0.2}
      zoom={{ initialScale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none py-7 shadow-none sm:py-9">
        <CardContent className="px-4 sm:px-6 lg:px-8">
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
            {steps.map((text, index) => {
              const Icon = stepIcons[index] ?? MousePointerClick;

              return (
                <MotionPreset
                  key={`resurs-soknad-step-${index}`}
                  className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:items-start sm:text-left lg:flex-col lg:items-center lg:text-center"
                  fade
                  blur
                  zoom={{ initialScale: 0.95 }}
                  transition={{ duration: 0.55 }}
                  delay={embedded ? 0.12 + index * 0.08 : 0.35 + index * 0.12}
                >
                  <IconBadge icon={Icon} />
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {text}
                  </span>
                </MotionPreset>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </MotionPreset>
  );

  if (embedded) {
    return inner;
  }

  return (
    <section className={PAGE_COMPACT_BAND_PY}>
      <ContainedLayout as="div">{inner}</ContainedLayout>
    </section>
  );
}
