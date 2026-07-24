"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AccountPaymentMethod } from "@/lib/account/types";
import { queryKeys } from "@/lib/tanstack/query-keys";

async function fetchPaymentMethods(): Promise<AccountPaymentMethod[]> {
  const response = await fetch("/api/account/payment-methods");
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    paymentMethods?: AccountPaymentMethod[];
    error?: string;
  } | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke hente betalingsmetoder.");
  }
  return data.paymentMethods ?? [];
}

function formatExpiry(method: AccountPaymentMethod): string | null {
  if (!method.expiryMonth || !method.expiryYear) return null;
  return `${method.expiryMonth}/${method.expiryYear.slice(-2)}`;
}

export function PaymentMethodsList() {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const methodsQuery = useQuery({
    queryKey: queryKeys.account.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (methodId: number) => {
      const response = await fetch(`/api/account/payment-methods/${methodId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Kunne ikke slette betalingsmetoden.");
      }
      return data.message ?? "Betalingsmetoden er slettet.";
    },
    onMutate: (methodId) => setPendingId(methodId),
    onSettled: () => setPendingId(null),
    onSuccess: async (message) => {
      setIsError(false);
      setStatusMessage(message);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.paymentMethods(),
      });
    },
    onError: (error) => {
      setIsError(true);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Kunne ikke slette betalingsmetoden."
      );
    },
  });

  const defaultMutation = useMutation({
    mutationFn: async (methodId: number) => {
      const response = await fetch(
        `/api/account/payment-methods/${methodId}/default`,
        { method: "POST" }
      );
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ?? "Kunne ikke oppdatere standard betalingsmetode."
        );
      }
      return data.message ?? "Standard betalingsmetode er oppdatert.";
    },
    onMutate: (methodId) => setPendingId(methodId),
    onSettled: () => setPendingId(null),
    onSuccess: async (message) => {
      setIsError(false);
      setStatusMessage(message);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.paymentMethods(),
      });
    },
    onError: (error) => {
      setIsError(true);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere standard betalingsmetode."
      );
    },
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <AccountAuthCard
        title="Betalingsmetoder"
        titleAs="h1"
        description="Lagrede kort og betalingsmetoder fra tidligere kjøp. Nye metoder legges til under kassen."
      >
        {methodsQuery.isLoading ? (
          <div className="space-y-4" role="status" aria-busy="true">
            <span className="sr-only">Laster betalingsmetoder...</span>
            {[0, 1].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 border-b border-border/70 py-4 first:pt-0"
              >
                <div className="w-full space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="h-9 w-24 shrink-0 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        ) : null}

        {methodsQuery.isError ? (
          <p className="text-sm text-red-700" role="alert">
            {methodsQuery.error instanceof Error
              ? methodsQuery.error.message
              : "Kunne ikke hente betalingsmetoder."}
          </p>
        ) : null}

        {methodsQuery.isSuccess && methodsQuery.data.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Du har ingen lagrede betalingsmetoder ennå. De vises her når
            betalingsløsningen lagrer et kort under kassen.
          </p>
        ) : null}

        {methodsQuery.isSuccess && methodsQuery.data.length > 0 ? (
          <ul className="divide-y divide-border/80" role="list">
            {methodsQuery.data.map((method) => {
              const expiry = formatExpiry(method);
              const busy = pendingId === method.id;
              return (
                <li
                  key={method.id}
                  className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1.5 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {method.display}
                      </p>
                      {method.isDefault ? (
                        <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[10px] uppercase">
                          Standard
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground">
                      {[method.gatewayTitle, expiry ? `Utløper ${expiry}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!method.isDefault ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => defaultMutation.mutate(method.id)}
                      >
                        Sett som standard
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Er du sikker på at du vil slette denne betalingsmetoden?"
                          )
                        ) {
                          deleteMutation.mutate(method.id);
                        }
                      }}
                    >
                      Slett
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {statusMessage ? (
          <p
            className={
              isError
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
