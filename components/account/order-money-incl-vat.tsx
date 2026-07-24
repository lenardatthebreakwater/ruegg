import { formatOrderMoney } from "@/lib/account/format";
import { cn } from "@/lib/utils";

type OrderMoneyInclVatProps = {
  value: string | null | undefined;
  className?: string;
  amountClassName?: string;
  suffixClassName?: string;
};

/** Amount + kr in emphasis; “inkl. mva” in regular weight. */
export function OrderMoneyInclVat({
  value,
  className,
  amountClassName,
  suffixClassName,
}: OrderMoneyInclVatProps) {
  const money = formatOrderMoney(value);
  if (money === "—") {
    return <span className={className}>—</span>;
  }

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span className={cn("font-semibold tabular-nums", amountClassName)}>
        {money}
      </span>
      <span
        className={cn(
          "text-sm font-normal text-muted-foreground",
          suffixClassName
        )}
      >
        inkl. mva
      </span>
    </span>
  );
}
