"use client";

import * as React from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { ProductImageGallery } from "@/components/product-detail/product-image-gallery";
import { ProductInfo, ProductMetaStrip } from "@/components/product-detail/product-info";
import { ProductTrustBanner } from "@/components/product-detail/product-trust-banner";
import { ShippingCalculator } from "@/components/product-detail/shipping-calculator";
import { ProductAccessoriesList } from "@/components/product-detail/product-accessories-list";
import {
  ProductMobileActionBar,
  ProductMobileAskExpertButton,
  ProductMobileAddToCartButton,
  STICKY_ATC_BUTTON_CLASS,
} from "@/components/product-detail/product-mobile-action-bar";
import { ProductAddToCartSection } from "@/components/product-detail/product-add-to-cart-section";
import { ProductPurchaseHighlights } from "@/components/product-detail/product-purchase-highlights";
import {
  ProductDetailTabsContent,
} from "@/components/product-detail/product-detail-tabs";
import { ProductInspirationGallery } from "@/components/product-detail/product-inspiration-gallery";
import { ProductContactFaqSection } from "@/components/product-detail/product-contact-faq-section";
import {
  hasProductFullSpecification,
  ProductFullSpecificationSection,
} from "@/components/product-detail/product-full-specification";
import { ProductSuggestionsSection } from "@/components/product-detail/product-suggestions-section";
import {
  AccentCard,
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import {
  PDP_DETAIL_SHELL_PADDING_CLASS,
  PDP_DETAIL_SHELL_STACK_CLASS,
  PDP_PANEL_STACK_CLASS,
} from "@/components/product-detail/pdp-panel-styles";
import { type GalleryImage } from "@/components/product-detail/product-image-gallery";
import { SectionIntro } from "@/components/section-intro";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { useHasScrolledPast } from "@/lib/hooks/use-intersection-in-view";
import { isFireplaceProduct } from "@/lib/products/is-fireplace-product";
import { mergeProductAttributes } from "@/lib/products/merge-product-attributes";
import type { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";

export type SingleProductContentProps = {
  product: Product;
  breadcrumbs: BreadcrumbItem[];
  similarProducts: Product[];
  className?: string;
};

const PDP_STACK_GAP = "gap-8 md:gap-10";
const PDP_BLOCK_SPACE_Y = "space-y-5 md:space-y-6";
const PDP_SECTION_INTRO_MARGIN = "mb-4 md:mb-5";
function getGalleryImages(product: Product): Array<{ sourceUrl: string; altText?: string }> {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  if (product.image?.sourceUrl) {
    return [{ sourceUrl: product.image.sourceUrl, altText: product.image.altText ?? undefined }];
  }
  return [];
}

function getPrimaryProductImage(
  product: Product,
  galleryImages: Array<{ sourceUrl: string; altText?: string }>
): GalleryImage | null {
  if (product.image?.sourceUrl) {
    return { sourceUrl: product.image.sourceUrl, altText: product.image.altText ?? undefined };
  }
  const fromGallery = galleryImages[0];
  if (fromGallery?.sourceUrl) {
    return { sourceUrl: fromGallery.sourceUrl, altText: fromGallery.altText };
  }
  return null;
}

function getFullSpecificationImages(
  product: Product,
  galleryImages: Array<{ sourceUrl: string; altText?: string }>
): GalleryImage[] {
  const primaryImage = getPrimaryProductImage(product, galleryImages);
  const blueprintImages: GalleryImage[] = (product.blueprintGallery ?? [])
    .filter((item) => Boolean(item.imageUrl))
    .map((item) => ({
      sourceUrl: item.imageUrl,
      altText: item.altText?.trim() || item.text?.trim() || product.name,
    }));

  const dedupedImages: GalleryImage[] = [];
  const seen = new Set<string>();
  const pushUnique = (image: GalleryImage | null) => {
    if (!image) return;
    if (seen.has(image.sourceUrl)) return;
    seen.add(image.sourceUrl);
    dedupedImages.push(image);
  };

  pushUnique(primaryImage);
  blueprintImages.forEach((image) => pushUnique(image));

  return dedupedImages;
}

function buildGalleryImagesWithVariationImages(
  product: Product,
  baseImages: Array<{ sourceUrl: string; altText?: string }>
): Array<{ sourceUrl: string; altText?: string }> {
  const images = [...baseImages];
  const seenUrls = new Set(baseImages.map((image) => image.sourceUrl));

  (product.variations ?? []).forEach((variation) => {
    const imageUrl = variation.image?.sourceUrl;
    if (!imageUrl || seenUrls.has(imageUrl)) return;
    seenUrls.add(imageUrl);
    images.push({
      sourceUrl: imageUrl,
      altText: variation.image?.altText ?? variation.name,
    });
  });

  return images;
}

function getDefaultActiveModelId(product: Product): string | null {
  const first = product.models?.[0];
  return first ? first.id : null;
}

function getDefaultSelectedVariationId(product: Product): string | null {
  const first = product.variations?.[0];
  return first ? first.id : null;
}

function parseNobbCandidates(rawNobb: string | null | undefined): string[] {
  const value = rawNobb?.trim();
  if (!value) return [];

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((candidate) => candidate.length > 0);
      }
    } catch {
      // Fall through to non-JSON parsing.
    }
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((candidate) => candidate.length > 0);
}

function getEffectiveProduct(product: Product, selectedVariationId: string | null): Product {
  if (!selectedVariationId || !product.variations || product.variations.length === 0) {
    const defaultNobb = parseNobbCandidates(product.nobb)[0] ?? product.nobb ?? null;
    return {
      ...product,
      nobb: defaultNobb,
    };
  }

  const selectedVariation = product.variations.find(
    (variation) => variation.id === selectedVariationId
  );
  if (!selectedVariation) return product;

  const selectedVariationIndex = product.variations.findIndex(
    (variation) => variation.id === selectedVariation.id
  );
  const parentNobbCandidates = parseNobbCandidates(product.nobb);
  const nobbFromParentList =
    selectedVariationIndex >= 0 ? parentNobbCandidates[selectedVariationIndex] : null;
  const effectiveNobb =
    selectedVariation.nobb?.trim() ||
    nobbFromParentList ||
    parentNobbCandidates[0] ||
    product.nobb ||
    null;

  return {
    ...product,
    id: selectedVariation.id,
    name: selectedVariation.name || product.name,
    image: selectedVariation.image ?? product.image,
    price: selectedVariation.price || product.price,
    priceNumeric: selectedVariation.priceNumeric ?? product.priceNumeric,
    regularPrice: selectedVariation.regularPrice ?? product.regularPrice,
    onSale: selectedVariation.onSale ?? product.onSale,
    saleBadge: selectedVariation.saleBadge ?? product.saleBadge,
    sku: selectedVariation.sku ?? product.sku,
    nobb: effectiveNobb,
    attributes: mergeProductAttributes(
      product.attributes,
      selectedVariation.attributes
    ),
    weight: selectedVariation.weight ?? product.weight,
    dimensions: selectedVariation.dimensions ?? product.dimensions,
    technicalInfo: selectedVariation.technicalInfo ?? product.technicalInfo,
    energyLabel: selectedVariation.energyLabel ?? product.energyLabel,
    energyRatingBadgeUrl:
      selectedVariation.energyRatingBadgeUrl ?? product.energyRatingBadgeUrl,
    energyLabelGuideUrl:
      selectedVariation.energyLabelGuideUrl ?? product.energyLabelGuideUrl,
    gtin: selectedVariation.gtin?.trim() || product.gtin || null,
  };
}

const PDP_SECTION_BAND_CLASS = "border-b border-primary/10";
const PDP_SECTION_BAND_MUTED_LIGHT = "bg-muted/35 dark:bg-muted/15";
const PDP_SECTION_BAND_MUTED_STRONG = "bg-muted/50 dark:bg-muted/20";

/** Tinted AccentCard shell so white Frakt / Produktdetaljer panels read like order-detail Produkter. */
function PdpDetailShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <AccentCard className={cn(PDP_DETAIL_SHELL_PADDING_CLASS, className)}>
      <div className={PDP_DETAIL_SHELL_STACK_CLASS}>{items}</div>
    </AccentCard>
  );
}

export function SingleProductContent({
  product,
  breadcrumbs,
  similarProducts,
  className,
}: SingleProductContentProps) {
  const [selectedVariationId, setSelectedVariationId] = React.useState<string | null>(() =>
    getDefaultSelectedVariationId(product)
  );
  const [activeModelId, setActiveModelId] = React.useState<string | null>(() =>
    getDefaultActiveModelId(product)
  );
  const [inlineAddToCartAnchor, setInlineAddToCartAnchor] =
    React.useState<HTMLDivElement | null>(null);
  // Sticky bar only after scrolling past the inline ATC — not while it's still below the fold.
  const showStickyAddToCart = useHasScrolledPast(inlineAddToCartAnchor);

  const effectiveProduct = getEffectiveProduct(product, selectedVariationId);
  const galleryImages = getGalleryImages(effectiveProduct);
  const galleryImagesWithVariants = buildGalleryImagesWithVariationImages(product, galleryImages);
  const activeModel = effectiveProduct.models?.find((m) => m.id === activeModelId);
  const selectedVariation = product.variations?.find((v) => v.id === selectedVariationId);
  const activeImageUrl =
    selectedVariation?.image?.sourceUrl ?? activeModel?.image?.sourceUrl ?? null;

  const handleGalleryActiveImageChange = React.useCallback(
    (image: GalleryImage) => {
      const matchingVariation = product.variations?.find(
        (variation) => variation.image?.sourceUrl === image.sourceUrl
      );
      if (matchingVariation) {
        setSelectedVariationId(matchingVariation.id);
      }
    },
    [product.variations]
  );

  const accessories = product.recommendedAccessories ?? [];
  const hasInspirationGallery = (effectiveProduct.inspirationGallery?.length ?? 0) > 0;
  const relatedProducts = effectiveProduct.relatedProducts ?? [];
  const fullSpecificationImages = getFullSpecificationImages(effectiveProduct, galleryImages);
  const hasFullSpecification = hasProductFullSpecification(effectiveProduct);
  const showShippingAndMeta = isFireplaceProduct(effectiveProduct);
  const sectionBlockClassName = cn("min-w-0", PDP_BLOCK_SPACE_Y);

  return (
    <main className={cn("flex flex-col", showStickyAddToCart && "pb-36 sm:pb-40", className)}>
      <section className="pt-8 md:pt-10">
        <ContainedLayout className={cn("flex flex-col", PDP_STACK_GAP)}>
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

          <div className="flex flex-col gap-8 md:gap-10">
            <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2 lg:items-start lg:gap-x-12 lg:gap-y-[100px]">
              <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                <ProductImageGallery
                  images={galleryImagesWithVariants}
                  activeImageUrl={activeImageUrl}
                  onActiveImageChange={handleGalleryActiveImageChange}
                />
              </div>

              <div className="min-w-0 space-y-6 lg:col-start-2 lg:row-start-1">
                <ProductInfo
                  product={effectiveProduct}
                  baseProductName={product.name}
                  variations={product.variations}
                  selectedVariationId={selectedVariationId}
                  onVariationChange={setSelectedVariationId}
                  models={effectiveProduct.models}
                  activeModelId={activeModelId}
                  onModelChange={setActiveModelId}
                  showModelSelector
                />
                <ProductAddToCartSection
                  ref={setInlineAddToCartAnchor}
                  product={effectiveProduct}
                />
                <ProductPurchaseHighlights />
                {showShippingAndMeta ? (
                  <div className={cn(PDP_PANEL_STACK_CLASS, "lg:hidden")}>
                    <ProductAccessoriesList accessories={accessories} />
                    <PdpDetailShell>
                      <ShippingCalculator product={effectiveProduct} />
                      <ProductMetaStrip product={effectiveProduct} />
                    </PdpDetailShell>
                  </div>
                ) : (
                  <>
                    <div className="hidden lg:block">
                      <PdpDetailShell>
                        <ProductMetaStrip product={effectiveProduct} />
                      </PdpDetailShell>
                    </div>
                    <ProductAccessoriesList accessories={accessories} />
                    <div className="lg:hidden">
                      <PdpDetailShell>
                        <ProductMetaStrip product={effectiveProduct} />
                      </PdpDetailShell>
                    </div>
                  </>
                )}
              </div>

              {showShippingAndMeta ? (
                <>
                  <div className="hidden min-w-0 lg:col-start-1 lg:row-start-2 lg:block">
                    <PdpDetailShell>
                      <ShippingCalculator product={effectiveProduct} />
                      <ProductMetaStrip product={effectiveProduct} />
                    </PdpDetailShell>
                  </div>
                  <div className="hidden min-w-0 lg:col-start-2 lg:row-start-2 lg:block">
                    <ProductAccessoriesList accessories={accessories} />
                  </div>
                </>
              ) : null}
            </div>

            <ProductTrustBanner className="w-full" />
          </div>
        </ContainedLayout>
      </section>

      <section
        className={cn(
          PDP_SECTION_BAND_CLASS,
          PDP_SECTION_BAND_MUTED_LIGHT,
          PAGE_SECTION_PY
        )}
      >
        <ContainedLayout className={cn("flex flex-col", PDP_STACK_GAP)}>
          <div className={sectionBlockClassName}>
            <SectionIntro
              title="Produktinfo"
              description="Les mer om produktet, dokumentasjon og nyttige detaljer før du velger modell."
              align="center"
              className={PDP_SECTION_INTRO_MARGIN}
              descriptionClassName={EDITORIAL_SECONDARY_TEXT_CLASS}
              renderTitle={(title) => (
                <span className="flex flex-col items-center gap-2">
                  <MetaRubricLabel as="span">Oversikt</MetaRubricLabel>
                  <span>{title}</span>
                </span>
              )}
            />
            <ProductDetailTabsContent product={effectiveProduct} />
          </div>

          {hasInspirationGallery ? (
            <div className={sectionBlockClassName}>
              <ProductInspirationGallery items={effectiveProduct.inspirationGallery ?? []} />
            </div>
          ) : null}

          {hasFullSpecification ? (
            <div className={sectionBlockClassName}>
              <ProductFullSpecificationSection
                product={effectiveProduct}
                images={fullSpecificationImages}
              />
            </div>
          ) : null}
        </ContainedLayout>
      </section>

      {similarProducts.length > 0 ? (
        <section
          className={cn(
            PDP_SECTION_BAND_CLASS,
            PDP_SECTION_BAND_MUTED_STRONG,
            PAGE_SECTION_PY
          )}
        >
          <ContainedLayout className="min-w-0">
            <ProductSuggestionsSection
              products={similarProducts}
              title="Lignende produkter"
              description="Utforsk flere modeller i samme stil, størrelse og ytelse."
              align="center"
              rubricLabel="Lignende"
            />
          </ContainedLayout>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section
          className={cn(
            PDP_SECTION_BAND_CLASS,
            PDP_SECTION_BAND_MUTED_LIGHT,
            PAGE_SECTION_PY
          )}
        >
          <ContainedLayout className="min-w-0">
            <ProductSuggestionsSection
              products={relatedProducts}
              title="Du vil kanskje også like"
              description="Andre produkter som ofte velges sammen med denne favoritten."
              align="center"
              rubricLabel="Anbefalt"
            />
          </ContainedLayout>
        </section>
      ) : null}

      <section
        className={cn(
          PDP_SECTION_BAND_MUTED_STRONG,
          "border-b-0",
          PAGE_SECTION_PY
        )}
      >
        <ContainedLayout className="min-w-0">
          <ProductContactFaqSection />
        </ContainedLayout>
      </section>

      {showStickyAddToCart ? (
        <ProductMobileActionBar className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200">
          <ProductMobileAskExpertButton product={effectiveProduct} />
          <ProductMobileAddToCartButton
            product={effectiveProduct}
            className={STICKY_ATC_BUTTON_CLASS}
          />
        </ProductMobileActionBar>
      ) : null}
    </main>
  );
}
