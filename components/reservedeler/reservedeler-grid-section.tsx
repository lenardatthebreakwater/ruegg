import {
  EDITORIAL_HEADER_BAND_CLASS,
  EditorialPageHeaderInner,
} from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { ReservedelerItemCard } from "@/components/reservedeler/reservedeler-item-card";
import {
  getOrderedBrandSlugs,
  getReservedelerBrandLabel,
  getReservedelerSectionBrand,
  groupItemsByBrand,
} from "@/lib/reservedeler/brand-order";
import type { ReservedelerItemCard as ReservedelerItemCardData } from "@/lib/reservedeler/types";

type ReservedelerGridSectionProps = {
  items: ReservedelerItemCardData[];
};

export function ReservedelerGridSection({ items }: ReservedelerGridSectionProps) {
  const groupedByBrand = groupItemsByBrand(items);
  const orderedBrandSlugs = getOrderedBrandSlugs(groupedByBrand);

  return (
    <>
      <header className={EDITORIAL_HEADER_BAND_CLASS}>
        <ContainedLayout>
          <EditorialPageHeaderInner
            title="Reservedeler"
            description="Finn modellen din og se alle kompatible reservedeler."
            descriptionClassName="max-w-3xl"
          />
        </ContainedLayout>
      </header>
      <ContainedLayout className="py-10 sm:py-12">
        {items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            Vi legger til reservedeler fortløpende. Ta kontakt dersom du ikke
            finner modellen din ennå.
          </p>
        ) : (
          <div className="mt-8 space-y-10">
            {orderedBrandSlugs.map((brandSlug) => {
              const brandItems = groupedByBrand.get(brandSlug) ?? [];
              if (brandItems.length === 0) return null;

              const sortedBrandItems = [...brandItems].sort((a, b) =>
                a.displayTitle.localeCompare(b.displayTitle, "nb-NO")
              );

              return (
                <section key={brandSlug} className="space-y-4">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {getReservedelerBrandLabel(brandSlug)}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedBrandItems.map((item) => (
                      <ReservedelerItemCard
                        key={`${getReservedelerSectionBrand(item)}-${item.itemSlug}`}
                        item={item}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </ContainedLayout>
    </>
  );
}
