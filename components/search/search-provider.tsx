"use client";

import { createContext, useContext, useState } from "react";
import { SearchPopup } from "@/components/search/search-popup";
import { useSearchProductsQuery } from "@/lib/tanstack/product-queries";

type SearchContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue>({
  open: false,
  setOpen: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchInstanceKey, setSearchInstanceKey] = useState(0);
  const productsQuery = useSearchProductsQuery({ enabled: open });
  const products = productsQuery.data ?? [];
  const handleSetOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setSearchInstanceKey((value) => value + 1);
    }
    setOpen(nextOpen);
  };

  return (
    <SearchContext.Provider value={{ open, setOpen: handleSetOpen }}>
      {children}
      <SearchPopup
        key={searchInstanceKey}
        open={open}
        onOpenChange={handleSetOpen}
        products={products}
        isLoading={productsQuery.isLoading}
        isFetching={productsQuery.isFetching}
      />
    </SearchContext.Provider>
  );
}
