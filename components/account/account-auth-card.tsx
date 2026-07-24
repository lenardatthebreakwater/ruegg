import type { ElementType, ReactNode } from "react";
import { AccentCard } from "@/components/editorial";
import { CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AccountAuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAside?: ReactNode;
  /** Heading level for the card title. Default h2 for pages that already have a page H1. */
  titleAs?: "h1" | "h2" | "div";
};

export function AccountAuthCard({
  title,
  description,
  children,
  className,
  headerAside,
  titleAs = "h2",
}: AccountAuthCardProps) {
  const TitleTag = titleAs as ElementType;

  return (
    <AccentCard
      className={cn(
        "flex w-full flex-col gap-6 py-6 pt-7 text-sm text-card-foreground",
        className
      )}
    >
      <CardHeader className="space-y-2 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <TitleTag
              data-slot="card-title"
              className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-[1.65rem]"
            >
              {title}
            </TitleTag>
            {description ? (
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAside}
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </AccentCard>
  );
}
