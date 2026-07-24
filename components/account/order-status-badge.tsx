import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Package,
  PauseCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { normalizeOrderStatus } from "@/lib/account/order-status";
import { cn } from "@/lib/utils";

/**
 * Gentle status tones for light + dark.
 * - Calm: in progress / on the way
 * - Success: completed
 * - Caution / error: needs follow-up
 */
const STATUS_CLASSES: Record<string, string> = {
  pending:
    "border-transparent bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200",
  processing:
    "border-transparent bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200",
  "on-hold":
    "border-transparent bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  completed:
    "border-transparent bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  cancelled:
    "border-transparent bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
  refunded:
    "border-transparent bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
  failed:
    "border-transparent bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
  "checkout-draft":
    "border-transparent bg-muted text-muted-foreground",
};

const STATUS_ICONS: Record<string, LucideIcon> = {
  pending: Clock,
  processing: Package,
  "on-hold": PauseCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
  refunded: RotateCcw,
  failed: AlertCircle,
  "checkout-draft": CircleDashed,
};

type OrderStatusBadgeProps = {
  status: string;
  label: string;
  className?: string;
};

export function OrderStatusBadge({
  status,
  label,
  className,
}: OrderStatusBadgeProps) {
  const normalized = normalizeOrderStatus(status);
  const Icon = STATUS_ICONS[normalized] ?? CircleDashed;

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1 rounded-md px-2 text-[11px] font-medium tracking-wide uppercase",
        STATUS_CLASSES[normalized] ??
          "border-transparent bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
