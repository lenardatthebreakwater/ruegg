"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { SectionIntro } from "@/components/section-intro";
import { SECTION_INTRO_BLOCK_MARGIN } from "@/lib/page-rhythm";
import type { ProductGalleryItem } from "@/lib/types/product";
import { cn } from "@/lib/utils";

type ProductInspirationGalleryProps = {
  items: ProductGalleryItem[];
  className?: string;
  title?: string;
  description?: string;
  ariaLabel?: string;
};

export function ProductInspirationGallery({
  items,
  className,
  title = "Inspirasjonsgalleri",
  description = "Se hvordan produktet ser ut i ulike hjem og interiormiljoer.",
  ariaLabel = "Inspirasjonsgalleri",
}: ProductInspirationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const normalizedItems = useMemo(
    () =>
      items
        .filter((item) => Boolean(item.imageUrl))
        .map((item, index) => ({
          imageUrl: item.imageUrl,
          text: item.text?.trim() || undefined,
          alt: item.altText?.trim() || item.text?.trim() || `Bilde ${index + 1}`,
        })),
    [items]
  );

  if (normalizedItems.length === 0) return null;
  const isOpen = selectedIndex !== null;
  const activeImage = selectedIndex !== null ? normalizedItems[selectedIndex] : null;

  const goToPrevImage = () => {
    if (selectedIndex === null) return;
    const nextIndex = (selectedIndex - 1 + normalizedItems.length) % normalizedItems.length;
    setSelectedIndex(nextIndex);
  };

  const goToNextImage = () => {
    if (selectedIndex === null) return;
    const nextIndex = (selectedIndex + 1) % normalizedItems.length;
    setSelectedIndex(nextIndex);
  };

  const scrollThumbsLeft = () => {
    thumbRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollThumbsRight = () => {
    thumbRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const renderTile = (item: (typeof normalizedItems)[number], index: number, tileClassName: string) => (
    <button
      key={`${item.imageUrl}-${index}`}
      type="button"
      onClick={() => setSelectedIndex(index)}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-primary/15 bg-muted text-left shadow-xs ring-1 ring-foreground/5 dark:border-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        tileClassName
      )}
      aria-label={`Vis bilde ${index + 1} i stor versjon`}
    >
      <ProductMediaImage
        src={item.imageUrl}
        alt={item.alt}
        sizes="(max-width: 768px) 50vw, 33vw"
        className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
      />
      {item.text ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[4.75rem] items-start bg-gradient-to-t from-black/75 via-black/40 to-transparent p-3 sm:min-h-[5.25rem] sm:p-4">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white sm:text-base">
            {item.text}
          </p>
        </div>
      ) : null}
    </button>
  );

  return (
    <section className={cn("w-full", className)} aria-label={ariaLabel}>
      <SectionIntro
        title={title}
        description={description}
        align="center"
        className={SECTION_INTRO_BLOCK_MARGIN}
        descriptionClassName={EDITORIAL_SECONDARY_TEXT_CLASS}
        renderTitle={(heading) => (
          <span className="flex flex-col items-center gap-2">
            <MetaRubricLabel as="span">Galleri</MetaRubricLabel>
            <span>{heading}</span>
          </span>
        )}
      />

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {normalizedItems.map((item, index) =>
          renderTile(item, index, "aspect-[4/3]")
        )}
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
        {normalizedItems.map((item, index) => renderTile(item, index, "aspect-[4/3]"))}
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "left-0 top-0 h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-transparent p-0 shadow-none",
            "data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0"
          )}
        >
          <DialogTitle className="sr-only">{`${title} i stor visning`}</DialogTitle>

          <div className="relative flex min-h-full w-full items-center justify-center p-3 sm:p-4">
            <div className="pointer-events-none absolute inset-0 bg-black/50" />
            <div className="relative flex w-full max-w-6xl flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-20"
                aria-label="Lukk bildevisning"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>

            <div className="relative">
              <div className="relative h-[52dvh] min-h-[220px] w-full overflow-hidden sm:h-[68vh]">
                {activeImage ? (
                  <ProductMediaImage
                    src={activeImage.imageUrl}
                    alt={activeImage.alt}
                    sizes="100vw"
                    fit="contain"
                    priority
                    className="object-center"
                  />
                ) : null}

                {normalizedItems.length > 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 rounded-full bg-background/90 sm:flex"
                      onClick={goToPrevImage}
                      aria-label="Forrige bilde"
                    >
                      <ChevronLeft className="size-5" />
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 rounded-full bg-background/90 sm:flex"
                      onClick={goToNextImage}
                      aria-label="Neste bilde"
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                  </>
                ) : null}
              </div>

              {activeImage?.text ? (
                <p className="pt-3 text-sm text-white/90 sm:text-base">{activeImage.text}</p>
              ) : null}
            </div>

            {normalizedItems.length > 1 ? (
              <div className="flex items-center gap-2">
                {normalizedItems.length > 5 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 rounded-full"
                    onClick={scrollThumbsLeft}
                    aria-label="Forrige bilder"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                ) : null}

                <div
                  ref={thumbRef}
                  className="min-w-0 flex-1 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {normalizedItems.map((item, index) => (
                    <button
                      key={`${item.imageUrl}-${index}-thumb`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={cn(
                        "relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20",
                        index === selectedIndex
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                      aria-label={`Vis bilde ${index + 1}`}
                      aria-current={index === selectedIndex ? "true" : undefined}
                    >
                      <ProductMediaImage
                        src={item.imageUrl}
                        alt={item.alt}
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>

                {normalizedItems.length > 5 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 rounded-full"
                    onClick={scrollThumbsRight}
                    aria-label="Neste bilder"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                ) : null}
              </div>
            ) : null}

            {normalizedItems.length > 1 ? (
              <div className="flex items-center justify-center gap-3 sm:hidden">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={goToPrevImage}
                  aria-label="Forrige bilde"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <span className="min-w-16 text-center text-sm font-medium text-white">
                  {(selectedIndex ?? 0) + 1} / {normalizedItems.length}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={goToNextImage}
                  aria-label="Neste bilde"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            ) : null}
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
