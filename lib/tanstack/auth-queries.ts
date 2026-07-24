"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { PasswordResetInput, SessionUser, SignupInput } from "@/lib/auth/types";
import { queryKeys } from "@/lib/tanstack/query-keys";

type AuthApiResponse = {
  ok?: boolean;
  error?: string;
};

type AuthWithUserApiResponse = AuthApiResponse & {
  user?: SessionUser;
};

type AuthWithMessageApiResponse = AuthApiResponse & {
  message?: string;
};

type AuthMeResponse = {
  ok?: boolean;
  authenticated?: boolean;
  user?: SessionUser | null;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let json: unknown = null;
  try {
    json = (await response.json()) as unknown;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const errorMessage =
      json &&
      typeof json === "object" &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "Uventet feil. Prøv igjen.";
    throw new Error(errorMessage);
  }

  return json as T;
}

export function useAuthMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { method: "GET" });
      const data = await parseJsonResponse<AuthMeResponse>(response);
      return data.user ?? null;
    },
    enabled,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      turnstileToken?: string;
    }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJsonResponse<AuthWithUserApiResponse>(response);

      if (!data.ok || !data.user) {
        throw new Error(data.error ?? "Innlogging feilet.");
      }

      return data.user;
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJsonResponse<AuthWithUserApiResponse>(response);

      if (!data.ok || !data.user) {
        throw new Error(data.error ?? "Kunne ikke opprette konto.");
      }

      return data.user;
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (input: { email: string; turnstileToken?: string }) => {
      const response = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJsonResponse<AuthWithMessageApiResponse>(response);
      return data.message ?? "Hvis e-posten finnes, sender vi deg en tilbakestillingslenke.";
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (input: PasswordResetInput) => {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJsonResponse<AuthWithMessageApiResponse>(response);

      if (!data.ok) {
        throw new Error(data.error ?? "Kunne ikke oppdatere passord.");
      }

      return data.message ?? "Passordet er oppdatert.";
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      await parseJsonResponse<AuthApiResponse>(response);
    },
  });
}
