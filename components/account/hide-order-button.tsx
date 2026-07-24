"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AccountTrash2Icon,
  useAnimatedIcon,
} from "@/components/account/account-animated-icon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { canHideOrderFromAccount } from "@/lib/account/order-status";
import type { AccountOrderSummary } from "@/lib/account/types";
import { queryKeys } from "@/lib/tanstack/query-keys";

const HIDE_CONFIRM_MESSAGE =
  "Ordren slettes ikke — den skjules bare fra oversikten din i Min konto. Vil du skjule denne ordren?";

type HideOrderButtonProps = {
  orderId: number;
  status: string | null | undefined;
  /** When true, navigate to the orders list after a successful hide. */
  redirectAfterHide?: boolean;
  size?: "sm" | "icon-sm";
  className?: string;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

async function hideOrder(orderId: number): Promise<string> {
  const response = await fetch(`/api/account/orders/${orderId}/hide`, {
    method: "POST",
  });
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    message?: string;
  } | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke skjule ordren.");
  }
  return data.message ?? "Ordren er skjult fra oversikten din.";
}

export function HideOrderButton({
  orderId,
  status,
  redirectAfterHide = false,
  size = "icon-sm",
  className,
  onError,
  onSuccess,
}: HideOrderButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const showLabel = size === "sm";
  const { ref: iconRef, triggerProps } = useAnimatedIcon();

  const hideMutation = useMutation({
    mutationFn: () => hideOrder(orderId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.account.orders() });
      const previous = queryClient.getQueryData<AccountOrderSummary[]>(
        queryKeys.account.orders()
      );
      if (previous) {
        queryClient.setQueryData<AccountOrderSummary[]>(
          queryKeys.account.orders(),
          previous.filter((order) => order.id !== orderId)
        );
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.account.orders(), context.previous);
      }
      onError?.(
        error instanceof Error ? error.message : "Kunne ikke skjule ordren."
      );
    },
    onSuccess: async (message) => {
      queryClient.removeQueries({
        queryKey: queryKeys.account.order(orderId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.orders(),
      });
      onSuccess?.(message);
      if (redirectAfterHide) {
        router.push("/min-konto/ordrer/");
      }
    },
  });

  if (!canHideOrderFromAccount(status)) {
    return null;
  }

  const label = hideMutation.isPending ? "Skjuler…" : "Skjul ordre";

  const button = (
    <Button
      type="button"
      size={size}
      variant="outline"
      className={className}
      disabled={hideMutation.isPending}
      aria-label="Skjul ordre"
      {...triggerProps}
      onClick={() => {
        if (!window.confirm(HIDE_CONFIRM_MESSAGE)) return;
        hideMutation.mutate();
      }}
    >
      <AccountTrash2Icon
        ref={iconRef}
        size={16}
        duration={0.75}
        data-icon="inline-start"
        aria-hidden
      />
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>Skjul ordre</TooltipContent>
    </Tooltip>
  );
}
