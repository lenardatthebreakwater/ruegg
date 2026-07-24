/**
 * Pure decision logic for product cache revalidation webhooks.
 * Kept free of Next.js APIs so Vitest can cover it without route mocks.
 */

export type ProductRevalidatePayload = {
  slug?: string;
  slugs?: string[];
  revalidateAll?: boolean;
};

export type ProductRevalidateDecision =
  | {
      ok: false;
      status: 400;
      error: string;
    }
  | {
      ok: true;
      revalidateAll: boolean;
      slugs: string[];
      /** Only true when the caller explicitly asked for a global products purge. */
      includeGlobalProductsTag: boolean;
    };

export function normalizeProductRevalidateSlugs(
  payload: ProductRevalidatePayload
): string[] {
  const values = [
    payload.slug,
    ...(Array.isArray(payload.slugs) ? payload.slugs : []),
  ];

  return [
    ...new Set(
      values.map((value) => value?.trim()).filter(Boolean) as string[]
    ),
  ];
}

/**
 * Ambiguous empty payloads must not purge the global "products" tag.
 * Global purge requires `{ revalidateAll: true }`; slug saves stay scoped.
 */
export function decideProductRevalidate(
  payload: ProductRevalidatePayload
): ProductRevalidateDecision {
  const slugs = normalizeProductRevalidateSlugs(payload);
  const revalidateAll = payload.revalidateAll === true;

  if (!revalidateAll && slugs.length === 0) {
    return {
      ok: false,
      status: 400,
      error:
        "Missing product slugs. Pass { slug } / { slugs }, or { revalidateAll: true } for a global purge.",
    };
  }

  return {
    ok: true,
    revalidateAll,
    slugs,
    includeGlobalProductsTag: revalidateAll,
  };
}
