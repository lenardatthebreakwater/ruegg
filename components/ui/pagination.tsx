"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PaginationProps = {
  /** 1-based current page */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called with 1-based page number when user selects a page */
  onPageChange?: (page: number) => void;
  /** If set, render links instead of buttons (for SEO/crawlable pages) */
  getPageHref?: (page: number) => string;
  /** Optional class for the nav container */
  className?: string;
};

function range(start: number, end: number): number[] {
  const len = Math.max(0, end - start + 1);
  return Array.from({ length: len }, (_, i) => start + i);
}

/**
 * Reusable pagination: prev/next and page numbers.
 * Use onPageChange for client-side pagination, or getPageHref for server/URL-based pagination.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  getPageHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Show a window of pages around current (e.g. 1 ... 4 5 6 ... 10)
  const windowSize = 2;
  let start = Math.max(1, currentPage - windowSize);
  let end = Math.min(totalPages, currentPage + windowSize);
  if (end - start < windowSize * 2) {
    if (start === 1) end = Math.min(totalPages, start + windowSize * 2);
    else if (end === totalPages) start = Math.max(1, end - windowSize * 2);
  }
  const pages = range(start, end);

  const handlePrev = () => hasPrev && onPageChange?.(currentPage - 1);
  const handleNext = () => hasNext && onPageChange?.(currentPage + 1);
  const handlePage = (page: number) => onPageChange?.(page);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      {getPageHref ? (
        <>
          {hasPrev ? (
            <Button asChild variant="outline" size="icon">
              <Link href={getPageHref(currentPage - 1)} aria-label="Forrige side">
                <ChevronLeft />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon" disabled aria-label="Forrige side">
              <ChevronLeft />
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="outline"
          size="icon"
          disabled={!hasPrev}
          onClick={handlePrev}
          aria-label="Forrige side"
        >
          <ChevronLeft />
        </Button>
      )}

      <div className="flex items-center gap-1">
        {start > 1 && (
          <>
            {getPageHref ? (
              <Button asChild variant="outline" size="sm">
                <Link href={getPageHref(1)}>1</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handlePage(1)}>
                1
              </Button>
            )}
            {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          if (getPageHref && !isCurrent) {
            return (
              <Button key={page} asChild variant="outline" size="sm">
                <Link href={getPageHref(page)}>{page}</Link>
              </Button>
            );
          }
          return (
            <Button
              key={page}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              className={isCurrent ? "pointer-events-none" : undefined}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => {
                if (!isCurrent) handlePage(page);
              }}
            >
              {page}
            </Button>
          );
        })}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            {getPageHref ? (
              <Button asChild variant="outline" size="sm">
                <Link href={getPageHref(totalPages)}>{totalPages}</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </>
        )}
      </div>

      {getPageHref ? (
        <>
          {hasNext ? (
            <Button asChild variant="outline" size="icon">
              <Link href={getPageHref(currentPage + 1)} aria-label="Neste side">
                <ChevronRight />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon" disabled aria-label="Neste side">
              <ChevronRight />
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="outline"
          size="icon"
          disabled={!hasNext}
          onClick={handleNext}
          aria-label="Neste side"
        >
          <ChevronRight />
        </Button>
      )}
    </nav>
  );
}
