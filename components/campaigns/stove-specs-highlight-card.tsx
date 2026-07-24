"use client";

import { type LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import { cn } from "@/lib/utils";

export type StoveSpecMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type StoveSpecsHighlightCardProps = {
  title?: string;
  metrics: StoveSpecMetric[];
  className?: string;
};

export function StoveSpecsHighlightCard({
  title = "Nøkkeltall",
  metrics,
  className,
}: StoveSpecsHighlightCardProps) {
  return (
    <MotionPreset
      fade
      blur
      delay={0.1}
      zoom={{ initialScale: 0.98 }}
      transition={{ duration: 0.45 }}
      className={cn("w-full", className)}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {metrics.map(({ icon: Icon, label, value }) => (
              <li
                key={label}
                className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 dark:bg-muted/10"
              >
                <IconBadge icon={Icon} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="text-base font-semibold tracking-tight text-foreground">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </MotionPreset>
  );
}
