import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CarouselLoopNavProps = {
  onScrollLeft: () => void;
  onScrollRight: () => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeftLabel: string;
  scrollRightLabel: string;
  className?: string;
};

export function CarouselLoopNav({
  onScrollLeft,
  onScrollRight,
  canScrollLeft,
  canScrollRight,
  scrollLeftLabel,
  scrollRightLabel,
  className,
}: CarouselLoopNavProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={onScrollLeft}
        onMouseDown={(event) => event.preventDefault()}
        disabled={!canScrollLeft}
        aria-label={scrollLeftLabel}
        className="size-9 shrink-0 rounded-lg"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onScrollRight}
        onMouseDown={(event) => event.preventDefault()}
        disabled={!canScrollRight}
        aria-label={scrollRightLabel}
        className="size-9 shrink-0 rounded-lg"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
