import {
  displayPaymentMethodTitle,
  resolvePaymentMethodMarks,
  type PaymentMethodMark as PaymentMethodMarkData,
} from "@/lib/payment/payment-method-marks"
import { cn } from "@/lib/utils"

type PaymentMethodMarkProps = {
  /** WooCommerce / order payment method title (raw; display may normalize). */
  title: string
  className?: string
  /** When false, only the logo is shown (title stays as accessible name). */
  showLabel?: boolean
}

function PaymentMethodMarkImage({
  mark,
  className,
}: {
  mark: PaymentMethodMarkData
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-white px-1.5 shadow-[0_1px_0_rgb(0_0_0_/0.04)] dark:border-transparent dark:bg-transparent dark:shadow-none",
        mark.chipClassName,
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVGs; light/dark swap when available */}
      <img
        src={mark.src}
        alt=""
        width={40}
        height={24}
        className={cn(
          "h-4 w-auto max-w-[2.75rem] object-contain",
          mark.srcDark && "dark:hidden",
          mark.invertOnDark && "dark:invert"
        )}
        decoding="async"
      />
      {mark.srcDark ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVGs; dark wordmark
        <img
          src={mark.srcDark}
          alt=""
          width={40}
          height={24}
          className="hidden h-4 w-auto max-w-[2.75rem] object-contain dark:block"
          decoding="async"
        />
      ) : null}
    </span>
  )
}

function PaymentMethodMarkImages({
  marks,
}: {
  marks: PaymentMethodMarkData[]
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {marks.map((mark) => (
        <PaymentMethodMarkImage key={mark.id} mark={mark} />
      ))}
    </span>
  )
}

/**
 * Renders a known payment provider mark next to its label.
 * Unknown titles fall back to text only.
 */
export function PaymentMethodMark({
  title,
  className,
  showLabel = true,
}: PaymentMethodMarkProps) {
  const marks = resolvePaymentMethodMarks(title)
  const label = displayPaymentMethodTitle(title)

  if (marks.length === 0) {
    return <p className={cn("font-medium", className)}>{label}</p>
  }

  if (!showLabel) {
    return (
      <span className={cn("inline-flex", className)} title={label}>
        <PaymentMethodMarkImages marks={marks} />
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <PaymentMethodMarkImages marks={marks} />
      <p className="min-w-0 font-medium">{label}</p>
    </div>
  )
}
