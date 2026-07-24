"use client";

import { type LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import { cn } from "@/lib/utils";

export type ArticleMetaTrustItem = {
  icon: LucideIcon;
  text: string;
};

type ArticleMetaTrustBannerProps = {
  items: ArticleMetaTrustItem[];
  className?: string;
};

export function ArticleMetaTrustBanner({ items, className }: ArticleMetaTrustBannerProps) {
  return (
    <MotionPreset
      fade
      blur
      delay={0.15}
      zoom={{ initialScale: 0.98 }}
      transition={{ duration: 0.45 }}
      className={cn("w-full", className)}
    >
      <Card
        role="region"
        aria-label="Lesetips"
        className="border-border/60 bg-muted/30 py-4 shadow-none"
      >
        <CardContent className="px-4 sm:px-6 lg:px-8">
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-6">
            {items.map(({ icon: Icon, text }, index) => (
              <MotionPreset
                key={text}
                className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left"
                fade
                blur
                zoom={{ initialScale: 0.98 }}
                transition={{ duration: 0.5 }}
                delay={0.25 + index * 0.1}
              >
                <IconBadge icon={Icon} />
                <span className="text-sm font-medium text-foreground sm:text-base">{text}</span>
              </MotionPreset>
            ))}
          </ul>
        </CardContent>
      </Card>
    </MotionPreset>
  );
}
