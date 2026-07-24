"use client";

import { create } from "zustand";
import type { Product } from "@/lib/types/product";

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    signal,
  });

  let json: unknown = null;
  try {
    json = (await res.json()) as unknown;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const apiError =
      json &&
      typeof json === "object" &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : `Request failed with ${res.status}`;
    throw new Error(apiError);
  }

  return json as T;
}

type ProductStore = {
  bestSelling: Product[];
  bestSellingFetched: boolean;
  popularFireplaces: Product[];
  popularFireplacesFetched: boolean;
  fetchBestSelling: (limit?: number) => Promise<void>;
  fetchPopularFireplaces: (limit?: number) => Promise<void>;
};

export const useProductStore = create<ProductStore>((set, get) => ({
  bestSelling: [],
  bestSellingFetched: false,
  popularFireplaces: [],
  popularFireplacesFetched: false,

  fetchBestSelling: async (limit = 8) => {
    if (get().bestSellingFetched) return;
    try {
      const data = await requestJson<{ products: Product[] }>(
        `/api/products/best-selling?limit=${Math.max(1, Math.trunc(limit))}`
      );
      set({ bestSelling: data.products, bestSellingFetched: true });
    } catch {
      set({ bestSellingFetched: true });
    }
  },

  fetchPopularFireplaces: async (limit = 8) => {
    if (get().popularFireplacesFetched) return;
    try {
      const data = await requestJson<{ products: Product[] }>(
        `/api/products/popular-fireplaces?limit=${Math.max(1, Math.trunc(limit))}`
      );
      set({ popularFireplaces: data.products, popularFireplacesFetched: true });
    } catch {
      set({ popularFireplacesFetched: true });
    }
  },
}));
