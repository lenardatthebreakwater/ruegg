import type { ProductArchiveViewMode } from "@/lib/types/product-archive";

const STORAGE_KEY = "peisbutikken.product-archive.view-mode";

export function readStoredProductArchiveViewMode(): ProductArchiveViewMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "grid" || value === "list") return value;
  } catch {
    // Private mode / blocked storage — ignore.
  }
  return null;
}

export function storeProductArchiveViewMode(mode: ProductArchiveViewMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private mode / blocked storage — ignore.
  }
}
