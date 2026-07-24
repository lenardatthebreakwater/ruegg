import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PayOrderButtonProps = {
  orderId: number;
  /**
   * Detail layout: full-width button + helper text.
   * List layout: prominent CTA that fits row actions (no helper).
   */
  layout?: "detail" | "list";
  className?: string;
};

export function PayOrderButton({
  orderId,
  layout = "list",
  className,
}: PayOrderButtonProps) {
  const button = (
    <Button
      asChild
      size="lg"
      variant="ctaGlow"
      className={cn(
        "h-11 gap-2 text-base",
        layout === "detail" ? "w-full" : "w-full sm:w-auto",
        className,
      )}
    >
      <a href={`/api/account/orders/${orderId}/pay`}>
        <CreditCard data-icon="inline-start" aria-hidden />
        Betal ordre
      </a>
    </Button>
  );

  if (layout === "detail") {
    return (
      <div className="space-y-2">
        {button}
        <p className="text-center text-xs text-muted-foreground">
          Fullfør betalingen for å få ordren behandlet
        </p>
      </div>
    );
  }

  return button;
}
