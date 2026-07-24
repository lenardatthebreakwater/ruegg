"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountCustomerAddress } from "@/lib/account/types";
import { queryKeys } from "@/lib/tanstack/query-keys";

type AddressesResponse = {
  ok?: boolean;
  billing?: AccountCustomerAddress;
  shipping?: AccountCustomerAddress;
  error?: string;
  message?: string;
};

type AddressDraft = {
  billing: AccountCustomerAddress;
  shipping: AccountCustomerAddress;
};

const EMPTY_ADDRESS: AccountCustomerAddress = {
  firstName: null,
  lastName: null,
  company: null,
  address1: null,
  address2: null,
  postcode: null,
  city: null,
  state: null,
  country: "NO",
  email: null,
  phone: null,
};

function normalizeAddress(
  address: AccountCustomerAddress | undefined
): AccountCustomerAddress {
  return {
    ...EMPTY_ADDRESS,
    ...address,
    country: address?.country || "NO",
  };
}

async function fetchAddresses(): Promise<AddressDraft> {
  const response = await fetch("/api/account/addresses");
  const data = (await response.json().catch(() => null)) as AddressesResponse | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke hente adressene.");
  }
  return {
    billing: normalizeAddress(data.billing),
    shipping: normalizeAddress(data.shipping),
  };
}

function AddressFields({
  idPrefix,
  values,
  onChange,
  includeContact,
}: {
  idPrefix: string;
  values: AccountCustomerAddress;
  onChange: (next: AccountCustomerAddress) => void;
  includeContact?: boolean;
}) {
  function setField<K extends keyof AccountCustomerAddress>(
    key: K,
    value: string
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-firstName`}>Fornavn</Label>
        <Input
          id={`${idPrefix}-firstName`}
          value={values.firstName ?? ""}
          onChange={(event) => setField("firstName", event.target.value)}
          autoComplete="given-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-lastName`}>Etternavn</Label>
        <Input
          id={`${idPrefix}-lastName`}
          value={values.lastName ?? ""}
          onChange={(event) => setField("lastName", event.target.value)}
          autoComplete="family-name"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-company`}>Firma (valgfritt)</Label>
        <Input
          id={`${idPrefix}-company`}
          value={values.company ?? ""}
          onChange={(event) => setField("company", event.target.value)}
          autoComplete="organization"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-address1`}>Adresse</Label>
        <Input
          id={`${idPrefix}-address1`}
          value={values.address1 ?? ""}
          onChange={(event) => setField("address1", event.target.value)}
          autoComplete="address-line1"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-address2`}>Adresse linje 2</Label>
        <Input
          id={`${idPrefix}-address2`}
          value={values.address2 ?? ""}
          onChange={(event) => setField("address2", event.target.value)}
          autoComplete="address-line2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-postcode`}>Postnummer</Label>
        <Input
          id={`${idPrefix}-postcode`}
          value={values.postcode ?? ""}
          onChange={(event) => setField("postcode", event.target.value)}
          autoComplete="postal-code"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>Sted</Label>
        <Input
          id={`${idPrefix}-city`}
          value={values.city ?? ""}
          onChange={(event) => setField("city", event.target.value)}
          autoComplete="address-level2"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-country`}>Landskode</Label>
        <Input
          id={`${idPrefix}-country`}
          value={values.country ?? "NO"}
          onChange={(event) =>
            setField("country", event.target.value.toUpperCase())
          }
          autoComplete="country"
          maxLength={2}
        />
      </div>
      {includeContact ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-email`}>E-post</Label>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              value={values.email ?? ""}
              onChange={(event) => setField("email", event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-phone`}>Telefon</Label>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              value={values.phone ?? ""}
              onChange={(event) => setField("phone", event.target.value)}
              autoComplete="tel"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AddressesForm() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AddressDraft | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const addressesQuery = useQuery({
    queryKey: queryKeys.account.addresses(),
    queryFn: fetchAddresses,
    staleTime: 60_000,
  });

  const values = draft ?? addressesQuery.data ?? null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!values) {
        throw new Error("Adressene er ikke lastet ennå.");
      }
      const response = await fetch("/api/account/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json().catch(() => null)) as AddressesResponse | null;
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Kunne ikke lagre adressene.");
      }
      return {
        billing: normalizeAddress(data.billing),
        shipping: normalizeAddress(data.shipping),
        message: data.message,
      };
    },
    onSuccess: async (data) => {
      setIsError(false);
      setStatusMessage(data.message ?? "Adressene er oppdatert.");
      setDraft({ billing: data.billing, shipping: data.shipping });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.addresses(),
      });
    },
    onError: (error) => {
      setIsError(true);
      setStatusMessage(
        error instanceof Error ? error.message : "Kunne ikke lagre adressene."
      );
    },
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <AccountAuthCard
        title="Adresser"
        titleAs="h1"
        description="Faktura- og leveringsadresse lagret på kontoen din."
      >
        {addressesQuery.isLoading ? (
          <div className="space-y-3" role="status" aria-busy="true">
            <span className="sr-only">Laster adresser...</span>
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded-md bg-muted" />
          </div>
        ) : null}

        {addressesQuery.isError ? (
          <p className="text-sm text-red-700" role="alert">
            {addressesQuery.error instanceof Error
              ? addressesQuery.error.message
              : "Kunne ikke hente adressene."}
          </p>
        ) : null}

        {values ? (
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              setStatusMessage("");
              saveMutation.mutate();
            }}
            noValidate
          >
            <section className="space-y-4 rounded-xl border border-border/70 bg-muted/15 p-4 md:p-5">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Fakturaadresse
              </h2>
              <AddressFields
                idPrefix="billing"
                values={values.billing}
                onChange={(billing) =>
                  setDraft({ billing, shipping: values.shipping })
                }
                includeContact
              />
            </section>

            <section className="space-y-4 rounded-xl border border-border/70 bg-muted/15 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Leveringsadresse
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraft({
                      billing: values.billing,
                      shipping: {
                        ...values.billing,
                        email: undefined,
                        phone: undefined,
                      },
                    })
                  }
                >
                  Kopier fra fakturaadresse
                </Button>
              </div>
              <AddressFields
                idPrefix="shipping"
                values={values.shipping}
                onChange={(shipping) =>
                  setDraft({ billing: values.billing, shipping })
                }
              />
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Lagrer..." : "Lagre adresser"}
              </Button>
              {statusMessage ? (
                <p
                  className={
                    isError
                      ? "text-sm text-red-700"
                      : "text-sm text-muted-foreground"
                  }
                  role="status"
                  aria-live="polite"
                >
                  {statusMessage}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </AccountAuthCard>
    </div>
  );
}
