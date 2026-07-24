import type { Product } from "@/lib/types/product";
import { graphqlRequest } from "@/lib/graphql/client";
import { MEDIA_ITEMS_BY_DATABASE_IDS_QUERY } from "@/lib/graphql/queries/products";
import type {
  WooMediaItemsByIdsResponse,
  WooProductMetaData,
  WooProductNode,
  WooProductVariationNode,
} from "@/lib/graphql/types";

function getMeta(
  meta: WooProductMetaData[] | null | undefined,
  key: string
): string | null {
  return meta?.find((entry) => entry.key === key)?.value ?? null;
}

/**
 * Fills `energyRatingBadgeUrl` / `energyLabelGuideUrl` when meta stores attachment IDs
 * (Jet Engine media). Batches one media query per unique ID.
 */
type PendingProductEnergyId = {
  scope: "product";
  index: number;
  field: "badge" | "guide";
  id: number;
};

type PendingVariationEnergyId = {
  scope: "variation";
  productIndex: number;
  variationIndex: number;
  field: "badge" | "guide";
  id: number;
};

function collectVariationEnergyIds(
  productIndex: number,
  product: Product,
  variationNodes: WooProductVariationNode[]
): PendingVariationEnergyId[] {
  const vars = product.variations;
  if (!vars?.length || !variationNodes.length) return [];

  const pending: PendingVariationEnergyId[] = [];
  const n = Math.min(variationNodes.length, vars.length);

  for (let j = 0; j < n; j++) {
    const vmeta = variationNodes[j].metaData;
    const rawVB =
      getMeta(vmeta, "energy-rating") ?? getMeta(vmeta, "energy_rating");
    const rawVG = getMeta(vmeta, "energy_label_image");

    if (
      !vars[j].energyRatingBadgeUrl &&
      rawVB?.trim() &&
      /^\d+$/.test(rawVB.trim())
    ) {
      const id = Number.parseInt(rawVB.trim(), 10);
      if (Number.isFinite(id)) {
        pending.push({
          scope: "variation",
          productIndex,
          variationIndex: j,
          field: "badge",
          id,
        });
      }
    }
    if (
      !vars[j].energyLabelGuideUrl &&
      rawVG?.trim() &&
      /^\d+$/.test(rawVG.trim())
    ) {
      const id = Number.parseInt(rawVG.trim(), 10);
      if (Number.isFinite(id)) {
        pending.push({
          scope: "variation",
          productIndex,
          variationIndex: j,
          field: "guide",
          id,
        });
      }
    }
  }

  return pending;
}

export async function enrichProductsEnergyMetaFromWooNodes(
  products: Product[],
  nodes: WooProductNode[]
): Promise<void> {
  if (products.length !== nodes.length || products.length === 0) return;

  const idSet = new Set<number>();
  const pending: Array<PendingProductEnergyId | PendingVariationEnergyId> = [];

  for (let i = 0; i < nodes.length; i++) {
    const meta = nodes[i].metaData;
    const rawBadge =
      getMeta(meta, "energy-rating") ?? getMeta(meta, "energy_rating");
    const rawGuide = getMeta(meta, "energy_label_image");

    if (
      !products[i].energyRatingBadgeUrl &&
      rawBadge?.trim() &&
      /^\d+$/.test(rawBadge.trim())
    ) {
      const id = Number.parseInt(rawBadge.trim(), 10);
      if (Number.isFinite(id)) {
        idSet.add(id);
        pending.push({ scope: "product", index: i, field: "badge", id });
      }
    }
    if (
      !products[i].energyLabelGuideUrl &&
      rawGuide?.trim() &&
      /^\d+$/.test(rawGuide.trim())
    ) {
      const id = Number.parseInt(rawGuide.trim(), 10);
      if (Number.isFinite(id)) {
        idSet.add(id);
        pending.push({ scope: "product", index: i, field: "guide", id });
      }
    }

    const varNodes = nodes[i].variations?.nodes;
    if (varNodes?.length) {
      for (const entry of collectVariationEnergyIds(i, products[i], varNodes)) {
        idSet.add(entry.id);
        pending.push(entry);
      }
    }
  }

  if (idSet.size === 0) return;

  try {
    const mediaData = await graphqlRequest<WooMediaItemsByIdsResponse>(
      MEDIA_ITEMS_BY_DATABASE_IDS_QUERY,
      { ids: [...idSet].map(String) }
    );
    const byId = new Map(
      (mediaData.mediaItems?.nodes ?? []).map((m) => [
        m.databaseId,
        m.sourceUrl,
      ])
    );

    for (const entry of pending) {
      const url = byId.get(entry.id);
      if (!url) continue;
      if (entry.scope === "product") {
        if (entry.field === "badge") {
          products[entry.index].energyRatingBadgeUrl = url;
        } else {
          products[entry.index].energyLabelGuideUrl = url;
        }
      } else {
        const v = products[entry.productIndex].variations?.[entry.variationIndex];
        if (!v) continue;
        if (entry.field === "badge") {
          v.energyRatingBadgeUrl = url;
        } else {
          v.energyLabelGuideUrl = url;
        }
      }
    }
  } catch {
    // Keep sync-mapped URLs only.
  }
}
