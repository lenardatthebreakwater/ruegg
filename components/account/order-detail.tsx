"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { HideOrderButton } from "@/components/account/hide-order-button";
import { OrderDetailSkeleton } from "@/components/account/account-loading-skeleton";
import { OrderMoneyInclVat } from "@/components/account/order-money-incl-vat";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PayOrderButton } from "@/components/account/pay-order-button";
import { PhoneDisplay } from "@/components/account/phone-display";
import {
  META_RUBRIC_PANEL_CLASS,
  META_RUBRIC_PANEL_SOFT_CLASS,
  MetaRubric,
  MetaRubricLabel,
} from "@/components/editorial";
import { PaymentMethodMark } from "@/components/payment/payment-method-mark";
import { Button } from "@/components/ui/button";
import {
  formatAccountAddressLines,
  formatOrderDate,
  formatOrderMoney,
} from "@/lib/account/format";
import type { AccountOrderDetail } from "@/lib/account/types";
import { buildProductHref } from "@/lib/products/paths";
import { queryKeys } from "@/lib/tanstack/query-keys";
import { cn } from "@/lib/utils";


type OrderDetailProps = {
  orderId: number;
};

function BackToOrdersButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link href="/min-konto/ordrer/">
        <ArrowLeft
          data-icon="inline-start"
          className="text-primary"
          aria-hidden
        />
        Tilbake til ordrer
      </Link>
    </Button>
  );
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

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: AccountOrderDetail["billing"];
}) {
  if (!address) return null;

  const name = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const postalLines = formatAccountAddressLines({
    ...address,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
  });
  const email = address.email?.trim() || null;
  const phone = address.phone?.trim() || null;

  if (!name && postalLines.length === 0 && !email && !phone) return null;

  return (
    <div className={cn(META_RUBRIC_PANEL_CLASS, "p-4")}>
      <MetaRubricLabel>{title}</MetaRubricLabel>

      <div className="mt-2.5 space-y-3">
        {name || postalLines.length > 0 ? (
          <div className="space-y-1 text-sm">
            {name ? (
              <p className="font-semibold text-foreground">{name}</p>
            ) : null}
            {postalLines.map((line) => (
              <p key={`${title}-${line}`} className="text-foreground/85">
                {line}
              </p>
            ))}
          </div>
        ) : null}

        {email || phone ? (
          <ul
            className="space-y-1.5 border-t border-primary/10 pt-3 text-sm"
            role="list"
          >
            {email ? (
              <li className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06] text-primary dark:bg-primary/10">
                  <Mail className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0 break-all text-foreground">{email}</span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06] text-primary dark:bg-primary/10">
                  <Phone className="size-3.5" aria-hidden />
                </span>
                <PhoneDisplay phone={phone} className="min-w-0 flex-1" />
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [isStatusError, setIsStatusError] = useState(false);

  const orderQuery = useQuery({
    queryKey: queryKeys.account.order(orderId),
    queryFn: () => fetchOrder(orderId),
    staleTime: 60_000,
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <BackToOrdersButton />
      </div>

      {orderQuery.isLoading ? (
        <AccountAuthCard
          title="Ordredetaljer"
          titleAs="h1"
          description="Detaljer for bestillingen din. Alle beløp er inkl. mva."
        >
          <OrderDetailSkeleton />
        </AccountAuthCard>
      ) : null}

      {orderQuery.isError ? (
        <AccountAuthCard
          title="Ordredetaljer"
          titleAs="h1"
          description="Detaljer for bestillingen din. Alle beløp er inkl. mva."
        >
          <p className="text-sm text-red-700" role="alert">
            {orderQuery.error instanceof Error
              ? orderQuery.error.message
              : "Kunne ikke hente ordren."}
          </p>
        </AccountAuthCard>
      ) : null}

      {orderQuery.data ? (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:items-start lg:gap-6 xl:gap-8">
          <AccountAuthCard
            title={`Ordre #${orderQuery.data.orderNumber}`}
            titleAs="h1"
            description="Detaljer for bestillingen din. Alle beløp er inkl. mva."
            headerAside={
              <OrderStatusBadge
                status={orderQuery.data.status}
                label={orderQuery.data.statusLabel}
              />
            }
          >
            <div className="min-w-0 space-y-8">
              <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-3 sm:grid-cols-2 sm:p-3.5 dark:bg-primary/[0.06] lg:grid-cols-3">
                <MetaRubric label="Bestilt">
                  <p className="font-medium">
                    {formatOrderDate(orderQuery.data.date)}
                  </p>
                </MetaRubric>
                {orderQuery.data.paymentMethodTitle ? (
                  <MetaRubric label="Betaling" align="center">
                    <PaymentMethodMark
                      title={orderQuery.data.paymentMethodTitle}
                    />
                  </MetaRubric>
                ) : null}
                <MetaRubric
                  label="Totalt"
                  align="right"
                  className={
                    orderQuery.data.paymentMethodTitle
                      ? "sm:col-span-2 lg:col-span-1"
                      : "sm:col-span-1"
                  }
                >
                  <OrderMoneyInclVat
                    value={orderQuery.data.total}
                    className="text-base font-semibold tracking-tight text-foreground"
                  />
                </MetaRubric>
              </div>

              {orderQuery.data.payUrl ? (
                <PayOrderButton orderId={orderId} layout="detail" />
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <HideOrderButton
                  orderId={orderId}
                  status={orderQuery.data.status}
                  size="sm"
                  redirectAfterHide
                  onError={(message) => {
                    setIsStatusError(true);
                    setStatusMessage(message);
                  }}
                />
              </div>

              {statusMessage ? (
                <p
                  className={
                    isStatusError
                      ? "text-sm text-red-700"
                      : "text-sm text-muted-foreground"
                  }
                  role="status"
                  aria-live="polite"
                >
                  {statusMessage}
                </p>
              ) : null}

              <div className={cn(META_RUBRIC_PANEL_SOFT_CLASS, "p-4")}>
                <MetaRubricLabel className="mb-3">Produkter</MetaRubricLabel>
                {orderQuery.data.lineItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ingen produktlinjer å vise.
                  </p>
                ) : (
                  <ul className="divide-y divide-primary/10" role="list">
                    {orderQuery.data.lineItems.map((item, index) => {
                      const productHref = item.slug
                        ? buildProductHref(item.slug)
                        : null;
                      const thumb = (
                        <span className="relative block size-14 shrink-0 overflow-hidden rounded-md border border-primary/15 bg-muted sm:size-16">
                          {item.image?.sourceUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote Woo thumbs; plain img like product cards
                            <img
                              src={item.image.sourceUrl}
                              alt={item.image.altText ?? item.name}
                              className="absolute inset-0 size-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </span>
                      );

                      return (
                        <li
                          key={`${item.slug ?? item.name}-${index}`}
                          className="flex items-start justify-between gap-4 py-3 text-sm"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            {productHref ? (
                              <Link
                                href={productHref}
                                className="block shrink-0"
                                aria-label={item.name}
                              >
                                {thumb}
                              </Link>
                            ) : (
                              thumb
                            )}
                            <div className="min-w-0">
                              {productHref ? (
                                <Link
                                  href={productHref}
                                  className="font-medium text-foreground underline underline-offset-4"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                <span className="font-medium text-foreground">
                                  {item.name}
                                </span>
                              )}
                              <p className="mt-0.5 text-muted-foreground">
                                Antall: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 font-medium tabular-nums text-foreground">
                            {formatOrderMoney(item.total)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Linjebeløp er inkl. mva.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AddressBlock
                  title="Fakturaadresse"
                  address={orderQuery.data.billing}
                />
                <AddressBlock
                  title="Leveringsadresse"
                  address={orderQuery.data.shipping}
                />
              </div>
            </div>
          </AccountAuthCard>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <OrderTimeline order={orderQuery.data} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
