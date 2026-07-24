"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  AccountEyeIcon,
  useAnimatedIcon,
} from "@/components/account/account-animated-icon";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { HideOrderButton } from "@/components/account/hide-order-button";
import { OrdersListSkeleton } from "@/components/account/account-loading-skeleton";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { PayOrderButton } from "@/components/account/pay-order-button";
import { Button } from "@/components/ui/button";
import { OrderMoneyInclVat } from "@/components/account/order-money-incl-vat";
import { META_RUBRIC_NESTED_CARD_CLASS } from "@/components/editorial";
import { PaymentMethodMark } from "@/components/payment/payment-method-mark";
import { formatOrderDate } from "@/lib/account/format";
import type { AccountOrderDetail, AccountOrderSummary } from "@/lib/account/types";
import { queryKeys } from "@/lib/tanstack/query-keys";
import { cn } from "@/lib/utils";

async function fetchOrders(): Promise<AccountOrderSummary[]> {
  const response = await fetch("/api/account/orders");
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    orders?: AccountOrderSummary[];
    error?: string;
  } | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke hente ordrer.");
  }
  return data.orders ?? [];
}

async function fetchOrder(orderId: number): Promise<AccountOrderDetail> {
  const response = await fetch(`/api/account/orders/${orderId}`);
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    order?: AccountOrderDetail;
    error?: string;
  } | null;
  if (!response.ok || !data?.ok || !data.order) {
    throw new Error(data?.error ?? "Kunne ikke hente ordren.");
  }
  return data.order;
}

function OrderDetailsLink({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const { ref: iconRef, triggerProps } = useAnimatedIcon();

  function prefetchOrder() {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.account.order(orderId),
      queryFn: () => fetchOrder(orderId),
      staleTime: 60_000,
    });
  }

  return (
    <Button asChild size="sm" variant="outline">
      <Link
        href={`/min-konto/ordrer/${orderId}/`}
        {...triggerProps}
        onMouseEnter={() => {
          triggerProps.onMouseEnter();
          prefetchOrder();
        }}
        onFocus={() => {
          triggerProps.onFocus();
          prefetchOrder();
        }}
        onTouchStart={prefetchOrder}
      >
        <AccountEyeIcon
          ref={iconRef}
          size={16}
          duration={0.75}
          data-icon="inline-start"
          aria-hidden
        />
        Se detaljer
      </Link>
    </Button>
  );
}

export function OrdersList() {
  const [statusMessage, setStatusMessage] = useState("");
  const [isStatusError, setIsStatusError] = useState(false);

  const ordersQuery = useQuery({
    queryKey: queryKeys.account.orders(),
    queryFn: fetchOrders,
    staleTime: 60_000,
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <AccountAuthCard
        title="Ordrene dine"
        titleAs="h1"
        description="Oversikt over bestillinger knyttet til kontoen din. Beløp vises inkl. mva."
      >
        {ordersQuery.isLoading ? <OrdersListSkeleton /> : null}

        {ordersQuery.isError ? (
          <p className="text-sm text-red-700" role="alert">
            {ordersQuery.error instanceof Error
              ? ordersQuery.error.message
              : "Kunne ikke hente ordrer."}
          </p>
        ) : null}

        {ordersQuery.isSuccess && ordersQuery.data.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Du har ingen ordrer ennå.{" "}
            <Link
              href="/shop/"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Se produkter
            </Link>
          </p>
        ) : null}

        {ordersQuery.isSuccess && ordersQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-3" role="list">
            {ordersQuery.data.map((order) => (
              <li
                key={order.id}
                className={cn(
                  META_RUBRIC_NESTED_CARD_CLASS,
                  "flex flex-col gap-3 p-3 sm:gap-3.5 sm:p-3.5"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        Ordre #{order.orderNumber}
                      </p>
                      <OrderStatusBadge
                        status={order.status}
                        label={order.statusLabel}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatOrderDate(order.date)}
                    </p>
                    {order.paymentMethodTitle ? (
                      <PaymentMethodMark
                        title={order.paymentMethodTitle}
                        className="text-sm [&_p]:text-sm [&_p]:leading-snug"
                      />
                    ) : null}
                    <OrderMoneyInclVat
                      value={order.total}
                      className="text-base tracking-tight text-foreground"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
                    <OrderDetailsLink orderId={order.id} />
                    <HideOrderButton
                      orderId={order.id}
                      status={order.status}
                      onSuccess={(message) => {
                        setIsStatusError(false);
                        setStatusMessage(message);
                      }}
                      onError={(message) => {
                        setIsStatusError(true);
                        setStatusMessage(message);
                      }}
                    />
                  </div>
                </div>
                {order.payUrl ? (
                  <PayOrderButton orderId={order.id} layout="list" />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {statusMessage ? (
          <p
            className={
              isStatusError
                ? "mt-5 text-sm text-red-700"
                : "mt-5 text-sm text-muted-foreground"
            }
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
        ) : null}
      </AccountAuthCard>
    </div>
  );
}
