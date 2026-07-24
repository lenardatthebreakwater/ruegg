import type { ProductAttribute } from "@/lib/types/product";

function attributeKey(attribute: ProductAttribute): string {
  return (attribute.name ?? attribute.label).trim().toLocaleLowerCase("nb-NO");
}

/**
 * Merge parent product attributes with the selected variation's attributes.
 *
 * Variation attributes must overlay matching parent rows (by `name` / `label`),
 * not replace the whole list — otherwise Full spesifikasjon loses technical
 * specs whenever a variation is selected (the PDP default).
 */
export function mergeProductAttributes(
  productAttributes: ProductAttribute[] | null | undefined,
  variationAttributes: ProductAttribute[] | null | undefined
): ProductAttribute[] | null {
  const parent = productAttributes?.filter((attr) => attr.label?.trim()) ?? [];
  const variation = variationAttributes?.filter((attr) => attr.label?.trim()) ?? [];

  if (variation.length === 0) {
    return parent.length > 0 ? parent : null;
  }
  if (parent.length === 0) {
    return variation;
  }

  const merged = new Map<string, ProductAttribute>();
  for (const attr of parent) {
    merged.set(attributeKey(attr), attr);
  }
  for (const attr of variation) {
    const key = attributeKey(attr);
    const existing = merged.get(key);
    merged.set(key, {
      ...existing,
      ...attr,
      name: attr.name ?? existing?.name,
      label: attr.label?.trim() || existing?.label || "",
      value: attr.value,
    });
  }

  return Array.from(merged.values());
}
