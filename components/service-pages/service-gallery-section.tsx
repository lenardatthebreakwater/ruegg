import { ContainedLayout } from "@/components/layout/contained-layout";
import { ProductInspirationGallery } from "@/components/product-detail/product-inspiration-gallery";
import type { ServiceGalleryItem } from "@/lib/data/service-pages";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type ServiceGallerySectionProps = {
  title: string;
  description: string;
  items: ServiceGalleryItem[];
};

export function ServiceGallerySection({
  title,
  description,
  items,
}: ServiceGallerySectionProps) {
  if (items.length === 0) return null;

  const inspirationItems = items.map((item) => ({
    imageUrl: item.imageUrl,
    altText: item.alt,
    text: item.caption,
  }));

  return (
    <section className={`border-b border-border bg-muted/20 ${PAGE_SECTION_PY}`}>
      <ContainedLayout as="div">
        <ProductInspirationGallery
          items={inspirationItems}
          title={title}
          description={description}
          ariaLabel={title}
        />
      </ContainedLayout>
    </section>
  );
}
