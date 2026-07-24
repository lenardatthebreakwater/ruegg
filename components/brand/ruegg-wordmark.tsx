import Link from "next/link";
import { cn } from "@/lib/utils";

type RueggWordmarkProps = {
  className?: string;
  /** When true, renders a non-interactive span (e.g. mobile sheet header). */
  static?: boolean;
};

/**
 * Text wordmark until dedicated Rüegg logo assets are added to `public/`.
 */
export function RueggWordmark({ className, static: isStatic = false }: RueggWordmarkProps) {
  const label = (
    <span
      className={cn(
        "font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl",
        className,
      )}
    >
      Rüegg
    </span>
  );

  if (isStatic) {
    return label;
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center hover:opacity-80"
      aria-label="Rüegg – hjem"
    >
      {label}
    </Link>
  );
}
