"use client";

import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";

import type { ProductArchiveSortOrder, ProductArchiveViewMode } from "@/lib/types/product-archive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ProductArchiveSortOrder; label: string }[] = [
  { value: "relevance", label: "Relevans" },
  { value: "name-asc", label: "Navn A–Z" },
  { value: "name-desc", label: "Navn Z–A" },
  { value: "price-asc", label: "Pris lav–høy" },
  { value: "price-desc", label: "Pris høy–lav" },
];

type ProductArchiveToolbarProps = {
  sortOrder: ProductArchiveSortOrder;
  onSortOrderChange: (order: ProductArchiveSortOrder) => void;
  viewMode: ProductArchiveViewMode;
  onViewModeChange: (mode: ProductArchiveViewMode) => void;
  onFilterClick?: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  showRelevanceSort?: boolean;
  className?: string;
};

export function ProductArchiveToolbar({
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  onFilterClick,
  searchQuery,
  onSearchQueryChange,
  resultCount,
  totalCount,
  showRelevanceSort = false,
  className,
}: ProductArchiveToolbarProps) {
  const sortOptions = showRelevanceSort
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((option) => option.value !== "relevance");

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
          placeholder="Søk i produktene..."
          className="h-9"
          aria-label="Søk i produkter"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount} av {totalCount}
        </span>
      </div>

      <div className="flex w-full items-center gap-3 lg:ml-auto lg:w-auto">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-w-0 flex-1 text-muted-foreground lg:hidden"
          onClick={onFilterClick}
        >
          <SlidersHorizontal className="size-4" />
          Filter
        </Button>
        <div className="min-w-0 flex-1 text-sm text-muted-foreground lg:flex-none">
          <Select
            value={sortOrder}
            onValueChange={(value) =>
              onSortOrderChange(value as ProductArchiveSortOrder)
            }
          >
            <SelectTrigger
              className="w-full lg:w-fit"
              aria-label="Sorteringsrekkefølge"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
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
