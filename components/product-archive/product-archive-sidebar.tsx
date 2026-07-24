"use client";

import type { Product } from "@/lib/types/product";
import type { ProductArchiveFilterConfig, ProductArchiveFilters } from "@/lib/types/product-archive";
import {
  getCanonicalArchiveAttribute,
  normalizeArchiveToken,
} from "@/lib/product-archive-attributes";
import { FilterSection } from "@/components/product-archive/filter-section";
import { PriceFilter } from "@/components/product-archive/price-filter";
import { MaxPowerFilter } from "@/components/product-archive/max-power-filter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CheckboxListFilter,
  type CheckboxOption,
} from "@/components/product-archive/checkbox-list-filter";
import { cn } from "@/lib/utils";

type AttributeFilterSection = {
  key: string;
  label: string;
  options: CheckboxOption[];
};

type ProductArchiveSidebarProps = {
  config: ProductArchiveFilterConfig;
  filters: ProductArchiveFilters;
  onFiltersChange: (f: ProductArchiveFilters) => void;
  /** All products (unfiltered) to derive options and min/max */
  allProducts: Product[];
  className?: string;
};

function uniqueSorted(arr: (string | null | undefined)[]): string[] {
  const set = new Set(arr.filter((x): x is string => Boolean(x)));
  return Array.from(set).sort();
}

function splitMultiValue(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function sortNorwegian(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, "nb-NO"));
}

function buildCheckboxOptions(values: string[]): CheckboxOption[] {
  const byKey = new Map<string, { label: string; count: number }>();
  for (const value of values) {
    const key = normalizeArchiveToken(value);
    const current = byKey.get(key);
    if (current) {
      current.count += 1;
      continue;
    }
    byKey.set(key, { label: value, count: 1 });
  }
  return sortNorwegian(Array.from(byKey.values()).map((v) => v.label)).map((label) => {
    const key = normalizeArchiveToken(label);
    return {
      value: label,
      label,
      count: byKey.get(key)?.count ?? 0,
    };
  });
}

function getPriceBounds(products: Product[]): { min: number; max: number } {
  const nums = products
    .map((p) => p.priceNumeric)
    .filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return { min: 0, max: 100000 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function getPowerBounds(products: Product[]): { min: number; max: number } {
  const nums = products
    .map((p) => p.maxPower)
    .filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return { min: 0, max: 15 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function getNominalPowerBounds(products: Product[]): { min: number; max: number } {
  const nums = products
    .map((p) => p.nominalPower)
    .filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return { min: 0, max: 15 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function getAttributeFilterSections(products: Product[]): AttributeFilterSection[] {
  const byLabel = new Map<string, { key: string; label: string; values: string[] }>();

  for (const product of products) {
    for (const attribute of product.attributes ?? []) {
      if (!attribute.label || !attribute.value) continue;
      const canonical = getCanonicalArchiveAttribute(attribute.label);
      if (!canonical) continue;
      const section = byLabel.get(canonical.key) ?? {
        key: canonical.key,
        label: canonical.label,
        values: [],
      };
      section.values.push(...splitMultiValue(attribute.value));
      byLabel.set(canonical.key, section);
    }
  }

  return Array.from(byLabel.values())
    .map((section) => ({
      key: section.key,
      label: section.label,
      options: buildCheckboxOptions(section.values),
    }))
    .filter((section) => section.options.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, "nb-NO"));
}

export function ProductArchiveSidebar({
  config,
  filters,
  onFiltersChange,
  allProducts,
  className,
}: ProductArchiveSidebarProps) {
  const priceBounds = getPriceBounds(allProducts);
  const powerBounds = getPowerBounds(allProducts);
  const nominalPowerBounds = getNominalPowerBounds(allProducts);
  const brandOptions: CheckboxOption[] = uniqueSorted(allProducts.map((p) => p.brand)).map(
    (b) => ({ value: b, label: b })
  );
  const fireplaceOptions: CheckboxOption[] = buildCheckboxOptions(
    allProducts.flatMap((p) => splitMultiValue(p.fireplaceType))
  );
  const colorOptions: CheckboxOption[] = buildCheckboxOptions(
    allProducts.flatMap((p) => splitMultiValue(p.color))
  );
  const attributeSections = getAttributeFilterSections(allProducts);

  const update = (patch: Partial<ProductArchiveFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  return (
    <aside className={cn("w-full shrink-0 lg:w-72", className)}>
      <Card className="gap-2 rounded-xl py-3 shadow-none">
        <CardHeader className="border-b px-5 pb-3">
          <h2 className="text-base font-semibold leading-normal">
            Filtrer produkter
          </h2>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex flex-col gap-0">
            {config.showPrice && (
              <FilterSection title="Pris">
                <PriceFilter
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={filters.priceRange}
                  onValueChange={(v) => update({ priceRange: v })}
                />
              </FilterSection>
            )}
            {config.showMaxPower && (
              <FilterSection title="Maks effekt">
                <MaxPowerFilter
                  min={powerBounds.min}
                  max={powerBounds.max}
                  value={filters.maxPowerRange}
                  onValueChange={(v) => update({ maxPowerRange: v })}
                />
              </FilterSection>
            )}
            {config.showNominalPower && (
              <FilterSection title="Nom. effekt">
                <MaxPowerFilter
                  min={nominalPowerBounds.min}
                  max={nominalPowerBounds.max}
                  value={filters.nominalPowerRange}
                  onValueChange={(v) => update({ nominalPowerRange: v })}
                  step={0.1}
                  maximumFractionDigits={1}
                />
              </FilterSection>
            )}
            {config.showBrand && brandOptions.length > 0 && (
              <FilterSection title="Merke">
                <CheckboxListFilter
                  options={brandOptions}
                  selected={filters.brands}
                  onSelectionChange={(brands) => update({ brands })}
                />
              </FilterSection>
            )}
            {config.showFireplaceType && fireplaceOptions.length > 0 && (
              <FilterSection title="Peistype">
                <CheckboxListFilter
                  options={fireplaceOptions}
                  selected={filters.fireplaceTypes}
                  onSelectionChange={(fireplaceTypes) => update({ fireplaceTypes })}
                />
              </FilterSection>
            )}
            {config.showColor && colorOptions.length > 0 && (
              <FilterSection title="Farge">
                <CheckboxListFilter
                  options={colorOptions}
                  selected={filters.colors}
                  onSelectionChange={(colors) => update({ colors })}
                />
              </FilterSection>
            )}
            {attributeSections.map((section) => (
              <FilterSection key={section.key} title={section.label}>
                <CheckboxListFilter
                  options={section.options}
                  selected={filters.attributeFilters[section.key] ?? []}
                  onSelectionChange={(selectedValues) => {
                    const nextAttributeFilters = { ...filters.attributeFilters };
                    if (selectedValues.length === 0) {
                      delete nextAttributeFilters[section.key];
                    } else {
                      nextAttributeFilters[section.key] = selectedValues;
                    }
                    update({ attributeFilters: nextAttributeFilters });
                  }}
                />
              </FilterSection>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
