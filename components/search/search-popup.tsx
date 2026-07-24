"use client";

import {
  useDeferredValue,
  useRef,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Search, Sparkles, TrendingUp, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useValueChangeEffect } from "@/lib/hooks/effect-last";
import type { SearchProduct } from "@/lib/types/search-product";
import { buildProductHref, buildProductsArchiveHref } from "@/lib/products/paths";
import { formatCardPrice } from "@/lib/products/format-card-price";
import {
  rankProductsByQuery,
  suggestSearchQueriesFromRanked,
} from "@/lib/search/product-search";
import {
  getPopularSearches,
  getRecentSearches,
  getSessionSearches,
  recordSearchQuery,
  trackSearchBiEvent,
} from "@/lib/search/search-history";

type SearchPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: SearchProduct[];
  isLoading: boolean;
  isFetching: boolean;
  className?: string;
};

const PREVIEW_RESULTS_LIMIT = 12;
const FULL_RESULTS_LIMIT = 48;

/** Toolbar row height: input + icon actions align to this (Tailwind `h-11`). */
const searchBarControlClass = "h-11 min-h-11";

function SearchSuggestionGroup({
  title,
  icon: Icon,
  suggestions,
  onPick,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  suggestions: string[];
  onPick: (value: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={`${title}-${suggestion}`}
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full"
            onClick={() => onPick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}

function SearchResultsGrid({
  products,
  query,
  onProductClick,
}: {
  products: SearchProduct[];
  query: string;
  onProductClick: (product: SearchProduct) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ingen produkter matcher <strong>{query}</strong>. Prøv et annet ord eller velg et forslag.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <Link
            href={buildProductHref(product.slug)}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40"
            onClick={() => onProductClick(product)}
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {product.image?.sourceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote Woo thumbs; plain img like product cards
                <img
                  src={product.image.sourceUrl}
                  alt={product.image.altText ?? product.name}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                {product.brand ?? ""}
              </p>
              <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
              <p className="mt-1 text-sm font-semibold">
                {formatCardPrice(product.price)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SearchPopup({
  open,
  onOpenChange,
  products,
  isLoading,
  isFetching,
  className,
}: SearchPopupProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = query.trim();
  const deferredTrimmedQuery = deferredQuery.trim();

  const rankedResults = useMemo(
    () => rankProductsByQuery(products, deferredTrimmedQuery),
    [products, deferredTrimmedQuery]
  );
  const allResults = useMemo(
    () => rankedResults.map((entry) => entry.product),
    [rankedResults]
  );
  const visibleResults = useMemo(
    () =>
      allResults.slice(
        0,
        showAllResults ? FULL_RESULTS_LIMIT : PREVIEW_RESULTS_LIMIT
      ),
    [allResults, showAllResults]
  );
  const querySuggestions = useMemo(
    () => suggestSearchQueriesFromRanked(rankedResults, deferredTrimmedQuery, 8),
    [rankedResults, deferredTrimmedQuery]
  );
  const recentSearches = useMemo(
    () => (open ? getRecentSearches(8) : []),
    [open]
  );
  const popularSearches = useMemo(
    () => (open ? getPopularSearches(8) : []),
    [open]
  );
  const sessionSearches = useMemo(
    () => (open ? getSessionSearches(8) : []),
    [open]
  );
  const isLoadingForQuery =
    trimmedQuery.length > 0 && products.length === 0 && (isLoading || isFetching);
  const hasRenderableQueryState = trimmedQuery.length > 0 && !isLoadingForQuery;

  useValueChangeEffect(hasRenderableQueryState, (value, previousValue) => {
    if (!value || previousValue) return;
    performance.mark("search-popup-results-ready");
    try {
      performance.measure(
        "search-popup-opened-to-results-ready",
        "search-popup-opened",
        "search-popup-results-ready"
      );
    } catch {
      // Ignore if marks are missing in edge browser cases.
    }
  });

  function submitSearch(
    source: "quick-search" | "full-search" | "suggestion",
    nextValue?: string
  ) {
    const nextQuery = (nextValue ?? query).trim();
    if (!nextQuery) return;
    const resultCount = rankProductsByQuery(products, nextQuery).length;

    recordSearchQuery(nextQuery);
    trackSearchBiEvent({
      eventType: "search_submitted",
      query: nextQuery,
      resultCount,
      source,
    });
  }

  function goToArchive(
    source: "quick-search" | "full-search" | "suggestion",
    nextValue?: string
  ) {
    const nextQuery = (nextValue ?? query).trim();
    if (!nextQuery) return;
    submitSearch(source, nextQuery);
    onOpenChange(false);
    router.push(
      `${buildProductsArchiveHref()}?q=${encodeURIComponent(nextQuery)}`
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "left-0 top-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:h-screen sm:max-h-none",
          className
        )}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          performance.mark("search-popup-opened");
          trackSearchBiEvent({
            eventType: "search_opened",
            source: "quick-search",
          });
          queueMicrotask(() => inputRef.current?.focus());
        }}
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          <div className="shrink-0 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-2 sm:gap-3">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    searchBarControlClass,
                    "w-11 min-w-11 shrink-0 sm:hidden"
                  )}
                  aria-label="Lukk"
                >
                  <ArrowLeft className="size-5" aria-hidden />
                </Button>
              </DialogClose>
              <div className="relative min-w-0 flex-1">
                <Input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    const nextQuery = e.target.value;
                    setQuery(nextQuery);
                    if (!nextQuery.trim()) {
                      setShowAllResults(false);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      goToArchive("quick-search");
                    }
                  }}
                  placeholder="Søk etter peiser, vedovner, merker eller modellnavn..."
                  className={cn(
                    searchBarControlClass,
                    "border-0 bg-transparent px-4 text-base shadow-none focus-visible:ring-0",
                    trimmedQuery ? "pr-11" : "pr-4"
                  )}
                  autoComplete="off"
                  aria-label="Search"
                />
                {trimmedQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-10 -translate-y-1/2"
                    onClick={() => {
                      setQuery("");
                      setShowAllResults(false);
                      queueMicrotask(() => inputRef.current?.focus());
                    }}
                    aria-label="Tøm søkefelt"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                className={cn(
                  searchBarControlClass,
                  "w-11 shrink-0 gap-0 px-0 sm:w-auto sm:gap-1.5 sm:px-2.5"
                )}
                onClick={() => {
                  goToArchive("quick-search");
                }}
                disabled={!trimmedQuery}
                aria-label="Søk"
              >
                <Search className="size-4" aria-hidden />
                <span className="hidden sm:inline">Søk</span>
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    searchBarControlClass,
                    "hidden w-11 min-w-11 shrink-0 sm:inline-flex"
                  )}
                  aria-label="Lukk"
                >
                  <X className="size-5" aria-hidden />
                </Button>
              </DialogClose>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-6">
            {!trimmedQuery ? (
              <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-3">
                <SearchSuggestionGroup
                  title="Fortsett der du slapp"
                  icon={History}
                  suggestions={sessionSearches}
                  onPick={(value) => {
                    trackSearchBiEvent({
                      eventType: "search_suggestion_clicked",
                      query: value,
                      source: "suggestion",
                    });
                    goToArchive("suggestion", value);
                  }}
                />
                <SearchSuggestionGroup
                  title="Dine siste søk"
                  icon={Sparkles}
                  suggestions={recentSearches}
                  onPick={(value) => {
                    trackSearchBiEvent({
                      eventType: "search_suggestion_clicked",
                      query: value,
                      source: "suggestion",
                    });
                    goToArchive("suggestion", value);
                  }}
                />
                <SearchSuggestionGroup
                  title="Populære søk"
                  icon={TrendingUp}
                  suggestions={popularSearches}
                  onPick={(value) => {
                    trackSearchBiEvent({
                      eventType: "search_suggestion_clicked",
                      query: value,
                      source: "suggestion",
                    });
                    goToArchive("suggestion", value);
                  }}
                />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-7xl space-y-5">
                {isLoadingForQuery ? (
                  <div className="rounded-lg border border-border bg-card/70 p-3 text-sm text-muted-foreground">
                    Henter produkter for søk ...
                  </div>
                ) : null}
                <SearchSuggestionGroup
                  title="Søkeordforslag"
                  icon={Sparkles}
                  suggestions={querySuggestions}
                  onPick={(value) => {
                    trackSearchBiEvent({
                      eventType: "search_suggestion_clicked",
                      query: value,
                      source: "suggestion",
                    });
                    goToArchive("suggestion", value);
                  }}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {allResults.length} treff for <strong>{trimmedQuery}</strong>
                  </p>
                  {!showAllResults && allResults.length > PREVIEW_RESULTS_LIMIT && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowAllResults(true);
                        submitSearch("quick-search");
                      }}
                    >
                      Vis flere
                    </Button>
                  )}
                </div>

                <SearchResultsGrid
                  products={visibleResults}
                  query={trimmedQuery}
                  onProductClick={(product) => {
                    trackSearchBiEvent({
                      eventType: "search_result_clicked",
                      query: trimmedQuery,
                      productSlug: product.slug,
                      source: "quick-search",
                    });
                    onOpenChange(false);
                  }}
                />

                {showAllResults && (
                  <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                    Fortsatt ikke riktig treff? Prøv et annet søkeord eller åpne
                    produktsiden for flere filtre.
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
