"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { cn } from "@/lib/utils";

export type GalleryImage = { sourceUrl: string; altText?: string };

function ProductGalleryNavButton({
  direction,
  onClick,
  ariaLabel,
  className,
}: {
  direction: "left" | "right";
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("size-8 shrink-0 rounded-full", className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon className="size-4" />
    </Button>
  );
}

type ProductImageGalleryProps = {
  images: GalleryImage[];
  mainImageOverride?: { sourceUrl: string; altText?: string } | null;
  activeImageUrl?: string | null;
  onActiveImageChange?: (image: GalleryImage) => void;
  imageFrameClassName?: string;
  className?: string;
  preferStaticForSingleImage?: boolean;
};

export function ProductImageGallery({
  images,
  mainImageOverride,
  activeImageUrl,
  onActiveImageChange,
  imageFrameClassName,
  className,
  preferStaticForSingleImage = false,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  /** Skip notifying parent while we scroll to match an external activeImageUrl (variation pill). */
  const suppressActiveImageNotifyRef = React.useRef(false);
  const onActiveImageChangeRef = React.useRef(onActiveImageChange);
  const renderedImages = React.useMemo(() => {
    if (!mainImageOverride) return images;
    if (images.some((image) => image.sourceUrl === mainImageOverride.sourceUrl)) {
      return images;
    }
    return [mainImageOverride, ...images];
  }, [images, mainImageOverride]);
  const renderedImagesRef = React.useRef(renderedImages);
  React.useLayoutEffect(() => {
    onActiveImageChangeRef.current = onActiveImageChange;
    renderedImagesRef.current = renderedImages;
  }, [onActiveImageChange, renderedImages]);

  const syncCarouselToThumb = (index: number) => {
    setActiveIndex(index);
    api?.scrollTo(index);
  };

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const nextActiveIndex = api.selectedScrollSnap();
      setActiveIndex(nextActiveIndex);
      if (suppressActiveImageNotifyRef.current) {
        suppressActiveImageNotifyRef.current = false;
        return;
      }
      const activeImage = renderedImagesRef.current[nextActiveIndex];
      if (activeImage) {
        onActiveImageChangeRef.current?.(activeImage);
      }
    };

    api.on("select", onSelect);
    // Do not call onSelect() here: parent passes an inline callback, so re-binding
    // would re-fire and reset variation selection back to the current slide.

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    if (!activeImageUrl) return;
    const nextIndex = renderedImages.findIndex((image) => image.sourceUrl === activeImageUrl);
    if (nextIndex < 0) return;
    if (nextIndex === api.selectedScrollSnap()) return;
    // Embla select handler updates activeIndex; avoid setState in this effect.
    suppressActiveImageNotifyRef.current = true;
    api.scrollTo(nextIndex);
  }, [activeImageUrl, api, renderedImages]);

  // Keep the active thumb in view as the main carousel / selection changes.
  React.useEffect(() => {
    if (!thumbApi) return;
    thumbApi.scrollTo(activeIndex);
  }, [activeIndex, thumbApi]);

  if (renderedImages.length === 0) return null;

  if (preferStaticForSingleImage && renderedImages.length === 1) {
    const image = renderedImages[0];
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-primary/15 bg-white shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-white",
            imageFrameClassName ?? "aspect-square"
          )}
        >
          <ProductMediaImage
            src={image.sourceUrl}
            alt={image.altText ?? ""}
            sizes="(max-width: 1024px) 100vw, 640px"
            fit="contain"
            priority
            draggable={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{ align: "start", loop: true }}
      >
        <CarouselContent>
          {renderedImages.map((image, index) => (
            <CarouselItem key={`${image.altText}-${index}`}>
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-xl border border-primary/15 bg-white shadow-xs ring-1 ring-foreground/5 dark:border-primary/20 dark:bg-white",
                  imageFrameClassName ?? "aspect-square"
                )}
              >
                <ProductMediaImage
                  src={image.sourceUrl}
                  alt={image.altText ?? ""}
                  sizes="(max-width: 1024px) 100vw, 640px"
                  fit="contain"
                  // First slide is the LCP element; the rest stay lazy.
                  priority={index === 0}
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {renderedImages.length > 1 ? (
          <>
            <ProductGalleryNavButton
              direction="left"
              onClick={() => api?.scrollPrev()}
              ariaLabel="Forrige bilde"
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-background/95 sm:left-3"
            />
            <ProductGalleryNavButton
              direction="right"
              onClick={() => api?.scrollNext()}
              ariaLabel="Neste bilde"
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-background/95 sm:right-3"
            />
          </>
        ) : null}
      </Carousel>

      {renderedImages.length > 1 && (
        <div className="flex items-center gap-2">
          {renderedImages.length > 5 && (
            <ProductGalleryNavButton
              direction="left"
              onClick={() => thumbApi?.scrollPrev()}
              ariaLabel="Forrige bilder"
            />
          )}

          <Carousel
            className="min-w-0 flex-1"
            setApi={setThumbApi}
            opts={{
              align: "start",
              dragFree: true,
              containScroll: "trimSnaps",
            }}
          >
            <CarouselContent className="-ml-2">
              {renderedImages.map((img, i) => (
                <CarouselItem key={i} className="basis-auto pl-2">
                  <button
                    type="button"
                    onClick={() => syncCarouselToThumb(i)}
                    className={cn(
                      "relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white dark:bg-white transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20",
                      i === activeIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                    aria-label={`Vis bilde ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                  >
                    <ProductMediaImage
                      src={img.sourceUrl}
                      alt={img.altText ?? ""}
                      sizes="80px"
                      className="pointer-events-none"
                      draggable={false}
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {renderedImages.length > 5 && (
            <ProductGalleryNavButton
              direction="right"
              onClick={() => thumbApi?.scrollNext()}
              ariaLabel="Neste bilder"
            />
          )}
        </div>
      )}
    </div>
  );
}
