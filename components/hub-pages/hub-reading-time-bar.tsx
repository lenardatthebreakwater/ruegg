"use client";

import { BookOpen, Clock3 } from "lucide-react";

import { ContainedLayout } from "@/components/layout/contained-layout";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import { PAGE_COMPACT_BAND_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const READING_TRUST_ITEMS = [
  {
    icon: Clock3,
    text: "Skummetid: 1 minutt",
  },
  {
    icon: BookOpen,
    text: "Lesetid: 3 minutter",
  },
] as const;

type HubReadingTimeBarProps = {
  className?: string;
};

export function HubReadingTimeBar({ className }: HubReadingTimeBarProps) {
  return (
    <section className={cn(PAGE_COMPACT_BAND_PY, "border-b border-border bg-muted/10", className)}>
      <ContainedLayout as="div">
        <MotionPreset
          fade
          blur
          delay={0.06}
          zoom={{ initialScale: 0.98 }}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <Card
            role="region"
            aria-label="Lesetid"
            className="border-border/60 bg-muted/30 py-4 shadow-none"
          >
            <CardContent className="px-4 sm:px-6 lg:px-8">
              <ul className="mx-auto grid w-full max-w-2xl list-none grid-cols-1 place-items-center gap-y-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 md:max-w-3xl md:gap-x-12 lg:gap-x-16">
                {READING_TRUST_ITEMS.map(({ icon: Icon, text }, index) => (
                  <li key={text} className="flex w-full min-w-0 justify-center">
                    <MotionPreset
                      className="flex items-center justify-center gap-3 text-center"
                      fade
                      blur
                      zoom={{ initialScale: 0.98 }}
                      transition={{ duration: 0.5 }}
                      delay={0.12 + index * 0.08}
                    >
                      <IconBadge icon={Icon} />
                      <span className="text-sm font-medium text-foreground sm:text-base">
                        {text}
                      </span>
                    </MotionPreset>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </MotionPreset>
      </ContainedLayout>
    </section>
  );
}
