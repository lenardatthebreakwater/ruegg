"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CheckboxOption = {
  value: string;
  label: string;
  count?: number;
};

type CheckboxListFilterProps = {
  options: CheckboxOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
  collapsedLimit?: number;
};

export function CheckboxListFilter({
  options,
  selected,
  onSelectionChange,
  className,
  collapsedLimit = 10,
}: CheckboxListFilterProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasOverflow = options.length > collapsedLimit;
  const visibleOptions = expanded || !hasOverflow ? options : options.slice(0, collapsedLimit);

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value];
    onSelectionChange(next);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {visibleOptions.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
        >
          <Checkbox
            checked={selected.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            aria-label={opt.label}
          />
          <span className="flex-1">{opt.label}</span>
          {opt.count != null && (
            <span className="text-muted-foreground text-xs">{opt.count}</span>
          )}
        </label>
      ))}
      {hasOverflow && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          className="h-auto w-fit px-0 text-sm font-medium text-foreground hover:text-foreground/80"
        >
          {expanded ? "Vis færre" : "Vis flere"}
        </Button>
      )}
    </div>
  );
}
