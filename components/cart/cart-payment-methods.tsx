import { PAYMENT_METHOD_MARKS } from "@/lib/payment/payment-method-marks"
import { cn } from "@/lib/utils"

type CartPaymentMethodsProps = {
  className?: string
}

export function CartPaymentMethods({ className }: CartPaymentMethodsProps) {
  return (
    <ul
      className={cn(
        "flex flex-nowrap items-center justify-center gap-1",
        className
      )}
      aria-label="Betalingsmetoder"
    >
      {PAYMENT_METHOD_MARKS.map((method) => (
        <li
          key={method.id}
          className="flex h-8 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-white px-0.5 shadow-[0_1px_0_rgb(0_0_0_/0.04)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVGs; keep markup light in the sheet footer */}
          <img
            src={method.src}
            alt={method.name}
            width={40}
            height={24}
            className="h-5 w-auto max-w-[120%] scale-125 object-contain"
            loading="lazy"
            decoding="async"
          />
        </li>
      ))}
    </ul>
  )
}
