import type {
  AccountOrderCustomerNote,
  AccountOrderDetail,
} from "@/lib/account/types";

export type OrderTimelineEventKind =
  | "received"
  | "paid"
  | "shipped"
  | "email"
  | "sms";

export type OrderTimelineEvent = {
  id: string;
  kind: OrderTimelineEventKind;
  date: string | null;
  content: string | null;
};

function noteEvent(note: AccountOrderCustomerNote): OrderTimelineEvent {
  return {
    id: `note-${note.id || note.type}-${note.date ?? "undated"}`,
    kind: note.type,
    date: note.date,
    content: note.content,
  };
}

function eventTime(date: string | null): number {
  if (!date) return Number.POSITIVE_INFINITY;
  const ms = Date.parse(date);
  return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
}

/**
 * Build a chronological left-rail timeline for Min konto order detail.
 * Status milestones from order dates + customer-facing email/SMS notes.
 */
export function buildOrderTimeline(
  order: Pick<
    AccountOrderDetail,
    "date" | "datePaid" | "dateCompleted" | "customerNotes"
  >
): OrderTimelineEvent[] {
  const events: OrderTimelineEvent[] = [
    {
      id: "status-received",
      kind: "received",
      date: order.date,
      content: null,
    },
  ];

  if (order.datePaid) {
    events.push({
      id: "status-paid",
      kind: "paid",
      date: order.datePaid,
      content: null,
    });
  }

  if (order.dateCompleted) {
    events.push({
      id: "status-shipped",
      kind: "shipped",
      date: order.dateCompleted,
      content: null,
    });
  }

  for (const note of order.customerNotes ?? []) {
    if (!note.content?.trim()) continue;
    events.push(noteEvent(note));
  }

  return events.sort((a, b) => {
    const delta = eventTime(a.date) - eventTime(b.date);
    if (delta !== 0) return delta;
    // Stable-ish: status milestones before notes at the same instant.
    const rank = (kind: OrderTimelineEventKind) => {
      if (kind === "received") return 0;
      if (kind === "paid") return 1;
      if (kind === "shipped") return 2;
      return 3;
    };
    return rank(a.kind) - rank(b.kind);
  });
}
