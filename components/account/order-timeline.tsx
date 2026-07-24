import { Mail, MessageSquare, Package, Truck, WalletCards } from "lucide-react";
import { AccentHeaderCard } from "@/components/editorial";
import { Badge } from "@/components/ui/badge";
import { formatOrderDateTime } from "@/lib/account/format";
import {
  buildOrderTimeline,
  type OrderTimelineEvent,
  type OrderTimelineEventKind,
} from "@/lib/account/order-timeline";
import type { AccountOrderDetail } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type OrderTimelineProps = {
  order: Pick<
    AccountOrderDetail,
    "date" | "datePaid" | "dateCompleted" | "customerNotes"
  >;
};

const EVENT_COPY: Record<
  OrderTimelineEventKind,
  { title: string; badge: string | null }
> = {
  received: { title: "Ordre mottatt", badge: null },
  paid: { title: "Betaling mottatt", badge: null },
  shipped: { title: "Ordre sendt", badge: null },
  email: { title: "Melding på e-post", badge: "E-post" },
  sms: { title: "Melding på SMS", badge: "SMS" },
};

function isMessageKind(kind: OrderTimelineEventKind): kind is "email" | "sms" {
  return kind === "email" || kind === "sms";
}

function EventIcon({ kind }: { kind: OrderTimelineEventKind }) {
  const className = "size-3.5";
  switch (kind) {
    case "received":
      return <Package className={className} aria-hidden />;
    case "paid":
      return <WalletCards className={className} aria-hidden />;
    case "shipped":
      return <Truck className={className} aria-hidden />;
    case "email":
      return <Mail className={className} aria-hidden />;
    case "sms":
      return <MessageSquare className={className} aria-hidden />;
  }
}

function TimelineItem({
  event,
  isLast,
}: {
  event: OrderTimelineEvent;
  isLast: boolean;
}) {
  const copy = EVENT_COPY[event.kind];
  const hasMessage = Boolean(event.content?.trim());
  const isMessage = isMessageKind(event.kind);

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast ? (
        <span
          className="absolute top-8 bottom-0 left-[15px] w-px bg-primary/25 dark:bg-primary/35"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          isMessage
            ? event.kind === "email"
              ? "border-teal-600/35 bg-teal-50 text-teal-900 shadow-sm shadow-teal-900/5 dark:border-teal-400/40 dark:bg-teal-500/15 dark:text-teal-100"
              : "border-sky-600/35 bg-sky-50 text-sky-900 shadow-sm shadow-sky-900/5 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-100"
            : "border-primary/50 bg-primary text-primary-foreground shadow-sm shadow-primary/20"
        )}
      >
        <EventIcon kind={event.kind} />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "min-w-0 text-sm text-foreground",
              isMessage ? "font-semibold" : "font-medium"
            )}
          >
            {copy.title}
          </p>
          {copy.badge ? (
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 font-medium tracking-wide uppercase",
                event.kind === "email"
                  ? "border-teal-600/30 bg-teal-50 text-teal-900 dark:border-teal-400/35 dark:bg-teal-500/15 dark:text-teal-100"
                  : "border-sky-600/30 bg-sky-50 text-sky-900 dark:border-sky-400/35 dark:bg-sky-500/15 dark:text-sky-100"
              )}
            >
              {copy.badge}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatOrderDateTime(event.date)}
        </p>
        {hasMessage ? (
          <div
            className={cn(
              "mt-2 rounded-lg border px-3 py-2.5 text-sm whitespace-pre-wrap text-foreground",
              event.kind === "email"
                ? "border-teal-300 border-l-[3px] border-l-teal-600 bg-teal-100 dark:border-teal-400/35 dark:border-l-teal-400 dark:bg-teal-500/15"
                : "border-sky-300 border-l-[3px] border-l-sky-600 bg-sky-100 dark:border-sky-400/35 dark:border-l-sky-400 dark:bg-sky-500/15"
            )}
          >
            {event.content}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const events = buildOrderTimeline(order);
  if (events.length === 0) return null;

  return (
    <AccentHeaderCard title="Ordreforløp" titleId="order-timeline-heading">
      <ol className="m-0 list-none p-0" role="list">
        {events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </ol>
    </AccentHeaderCard>
  );
}
