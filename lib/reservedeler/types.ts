export type ReservedelerItemSourceRecord = {
  brandSlug?: string | null;
  itemSlug?: string | null;
  itemTermSlug?: string | null;
  name?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  reservedelerCardImage?: string | null;
  reservedelerCardImageAlt?: string | null;
  reservedelerTaxonomy?: string | null;
};

export type ReservedelerItemsApiResponse = {
  items?: ReservedelerItemSourceRecord[] | null;
};

export type ReservedelerItemCard = {
  brandSlug: string;
  itemSlug: string;
  rawTitle: string;
  displayTitle: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  reservedelerTaxonomy?: string | null;
};
