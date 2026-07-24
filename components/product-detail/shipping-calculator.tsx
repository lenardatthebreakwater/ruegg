"use client";

import * as React from "react";
import { TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITORIAL_SECONDARY_TEXT_CLASS, MetaRubricLabel } from "@/components/editorial";
import type { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import {
  PDP_INNER_PANEL_SOFT_CLASS,
  PDP_PANEL_PADDING_CLASS,
} from "@/components/product-detail/pdp-panel-styles";

type ShippingCountry = "NO" | "SE";
type ShippingMethod = {
  id: string;
  name: string;
  priceLabel?: string;
};

const SHIPPING_COUNTRY_OPTIONS: Array<{ value: ShippingCountry; label: string }> = [
  { value: "NO", label: "Norge" },
  { value: "SE", label: "Sverige" },
];

function normalizePostcode(input: string): string {
  return input.replace(/\s+/g, "").trim();
}

function isValidPostcode(country: ShippingCountry, postcode: string): boolean {
  const normalized = normalizePostcode(postcode);
  if (country === "NO") return /^\d{4}$/.test(normalized);
  return /^\d{5}$/.test(normalized);
}

type ShippingCalculatorProps = {
  product: Product;
};

type ShippingQuoteResponse = {
  ok: boolean;
  methods?: ShippingMethod[];
  error?: string;
};

export function ShippingCalculator({ product }: ShippingCalculatorProps) {
  const [country, setCountry] = React.useState<ShippingCountry | "">("");
  const [postcode, setPostcode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [methods, setMethods] = React.useState<ShippingMethod[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onCalculate = React.useCallback(async () => {
    if (!country) {
      setError("Velg land/region for å beregne frakt.");
      setMethods(null);
      return;
    }

    if (!isValidPostcode(country, postcode)) {
      setError(
        country === "NO"
          ? "Oppgi et gyldig norsk postnummer (4 sifre)."
          : "Oppgi et gyldig svensk postnummer (5 sifre)."
      );
      setMethods(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          postcode: normalizePostcode(postcode),
          productId: product.id,
          productSlug: product.slug,
          quantity: 1,
        }),
      });

      const data = (await response.json()) as ShippingQuoteResponse;
      if (!response.ok || !data.ok) {
        setMethods(null);
        setError(data.error ?? "Kunne ikke beregne frakt akkurat nå.");
        return;
      }

      const shippingMethods = data.methods ?? [];
      setMethods(shippingMethods);
      if (shippingMethods.length === 0) {
        setError("Ingen forsendelsesmetoder er tilgjengelige for valgt område.");
      } else {
        setError(null);
      }
    } catch {
      setMethods(null);
      setError("Kunne ikke beregne frakt akkurat nå.");
    } finally {
      setIsLoading(false);
    }
  }, [country, postcode, product.id, product.slug]);

  return (
    <div className={cn(PDP_INNER_PANEL_SOFT_CLASS, "overflow-hidden")}>
      <div className={cn("flex items-center gap-3", PDP_PANEL_PADDING_CLASS)}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06] text-primary dark:bg-primary/10">
          <TruckIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <MetaRubricLabel>Frakt</MetaRubricLabel>
          <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-foreground">
            Beregn frakt
          </h2>
        </div>
      </div>
      <div className={cn("border-t border-primary/10", PDP_PANEL_PADDING_CLASS)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
          <Select value={country} onValueChange={(value) => setCountry(value as ShippingCountry)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Velg land/region" />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_COUNTRY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Postnummer"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
            className="w-full"
          />

          <Button
            type="button"
            onClick={onCalculate}
            disabled={isLoading}
          >
            {isLoading ? "Beregner..." : "Beregn"}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        {methods && methods.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground">
              Tilgjengelige forsendelsesmetoder
            </h3>
            <ul className={cn("mt-2 space-y-1.5 text-sm", EDITORIAL_SECONDARY_TEXT_CLASS)}>
              {methods.map((method) => (
                <li key={method.id} className="flex items-start justify-between gap-3">
                  <span>{method.name}</span>
                  {method.priceLabel ? (
                    <span className="font-medium text-foreground">{method.priceLabel}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
