"use client";

import * as React from "react";
import { LayoutGrid, List, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RESERVED_BRAND_ORDER,
  getReservedelerBrandLabel,
  type ReservedelerBrandFilter,
} from "@/lib/reservedeler/brand-order";
import type { ProductArchiveViewMode } from "@/lib/types/product-archive";
import { cn } from "@/lib/utils";

type ReservedelerToolbarProps = {
  brandFilter: ReservedelerBrandFilter;
  onBrandFilterChange: (value: ReservedelerBrandFilter) => void;
  viewMode: ProductArchiveViewMode;
  onViewModeChange: (mode: ProductArchiveViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
};

export function ReservedelerToolbar({
  brandFilter,
  onBrandFilterChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  resultCount,
  totalCount,
  className,
}: ReservedelerToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3",
        className
      )}
    >
      <div className="flex min-w-[240px] flex-1 items-center gap-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Søk etter peismodell…"
          className="h-9"
          aria-label="Søk i reservedeler"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount} av {totalCount}
        </span>
      </div>

      <div className="flex w-full items-center gap-3 lg:ml-auto lg:w-auto">
        <div className="min-w-0 flex-1 text-sm text-muted-foreground lg:flex-none">
          <Select
            value={brandFilter}
            onValueChange={(value) =>
              onBrandFilterChange(value as ReservedelerBrandFilter)
            }
          >
            <SelectTrigger
              className="w-full lg:w-fit"
              aria-label="Filtrer etter merke"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Alle</SelectItem>
                <SelectSeparator />
                {RESERVED_BRAND_ORDER.map((slug) => (
                  <React.Fragment key={slug}>
                    {slug === "asgard" ? <SelectSeparator /> : null}
                    <SelectItem value={slug}>
                      {getReservedelerBrandLabel(slug)}
                    </SelectItem>
                  </React.Fragment>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Visning">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
            aria-label="Rutenettvisning"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            aria-label="Listevisning"
            aria-pressed={viewMode === "list"}
          >
            <List />
          </Button>
        </div>
      </div>
    </div>
  );
}
