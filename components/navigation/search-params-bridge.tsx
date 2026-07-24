"use client";

import { useEffect } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

type SearchParamsBridgeProps = {
  onParams: (params: ReadonlyURLSearchParams) => void;
};

/**
 * Isolates useSearchParams() so its static-prerender bailout stays confined to
 * this (invisible) subtree. Render it inside a `<Suspense fallback={null}>`
 * next to the content that needs the params; the params are handed up via
 * effect after hydration, so the surrounding content is fully server-rendered
 * on SSG pages (calling useSearchParams directly in that content would make
 * the prerendered HTML contain only the Suspense fallback).
 */
export function SearchParamsBridge({ onParams }: SearchParamsBridgeProps) {
  const params = useSearchParams();

  useEffect(() => {
    onParams(params);
  }, [params, onParams]);

  return null;
}
