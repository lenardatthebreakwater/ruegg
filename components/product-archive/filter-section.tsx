"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <Collapsible
      defaultOpen
      className={cn(
        "flex w-full flex-col border-b px-5 py-5 last:border-b-0",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <CollapsibleTrigger>
          <ChevronDownIcon className="size-5 transition-transform duration-300 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-3 pt-4 data-[state=closed]:overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:overflow-visible data-[state=open]:animate-collapsible-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
