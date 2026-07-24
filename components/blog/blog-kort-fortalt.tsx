"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import type { BlogTldrItem } from "@/lib/blog/types";
import { demoteHeadings } from "@/lib/html/demote-headings";
import { AccentCard } from "@/components/editorial";
import {
  PDP_PANEL_PADDING_CLASS,
  PDP_PANEL_TOGGLE_BUTTON_CLASS,
} from "@/components/product-detail/pdp-panel-styles";
import { cn } from "@/lib/utils";

type BlogKortFortaltProps = {
  items: BlogTldrItem[];
  className?: string;
};

/** Sticky “Kort fortalt” summary; collapsed on mobile with Vis mer. */
export function BlogKortFortalt({ items, className }: BlogKortFortaltProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (items.length === 0) return null;

  const hasMore = items.length > 1;

  return (
    <aside
      className={cn(
        "lg:sticky lg:top-28 lg:self-start",
        className
      )}
      aria-label="Kort fortalt"
    >
      <AccentCard>
        <div className="flex items-center gap-3 border-b border-border/60 px-5 pt-5 pb-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Flame className="size-4.5" aria-hidden />
          </span>
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            Kort fortalt
          </p>
        </div>

        <div className={cn(PDP_PANEL_PADDING_CLASS, "space-y-5")}>
          {items.map((item, index) => {
            const hiddenOnMobile = hasMore && index > 0 && !expanded;
            return (
              <div
                key={item.slot}
                className={cn(
                  index > 0 && "border-t border-border/60 pt-5",
                  hiddenOnMobile && "hidden lg:block"
                )}
              >
                {item.heading ? (
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                    {item.heading}
                  </h3>
                ) : null}
                {item.html ? (
                  <div
                    className={cn(
                      "prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground",
                      "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
                      "prose-li:marker:text-primary",
                      "prose-strong:text-foreground prose-a:text-primary",
                      item.heading ? "mt-2" : ""
                    )}
                    dangerouslySetInnerHTML={{
                      __html: demoteHeadings(item.html),
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {hasMore ? (
          <button
            type="button"
            className={cn(PDP_PANEL_TOGGLE_BUTTON_CLASS, "lg:hidden")}
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Vis mindre" : "Vis mer"}
          </button>
        ) : null}
      </AccentCard>
    </aside>
  );
}
