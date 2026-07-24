const STATUS_LABELS: Record<string, string> = {
  pending: "Avventer betaling",
  processing: "Behandles",
  "on-hold": "På vent",
  completed: "Fullført",
  cancelled: "Kansellert",
  refunded: "Refundert",
  failed: "Mislykket",
  "checkout-draft": "Utkast",
};

/** Statuses customers may hide from Min konto (must match WordPress). */
const HIDEABLE_ORDER_STATUSES = new Set(["failed", "cancelled", "refunded"]);

/**
 * Map WooCommerce order status (with or without `wc-` prefix) to Norwegian UI copy.
 */
export function getOrderStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeOrderStatus(status);
  if (!normalized) return "Ukjent status";
  return STATUS_LABELS[normalized] ?? normalized;
}

export function normalizeOrderStatus(status: string | null | undefined): string {
  const raw = (status ?? "").trim().toLocaleLowerCase("nb-NO");
  return raw.startsWith("wc-") ? raw.slice(3) : raw;
}

/**
 * Whether the customer may hide this order from their account overview.
 * Only failed / cancelled / refunded — enforced again on WordPress.
 */
export function canHideOrderFromAccount(
  status: string | null | undefined
): boolean {
  return HIDEABLE_ORDER_STATUSES.has(normalizeOrderStatus(status));
}
