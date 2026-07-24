import type { AuthErrorCode } from "@/lib/auth/types";

const DEFAULT_ERROR_MESSAGE = "Noe gikk galt. Prøv igjen om litt.";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_INPUT: "Vennligst kontroller feltene og prøv igjen.",
  INVALID_CREDENTIALS: "Feil e-post eller passord.",
  EMAIL_IN_USE: "E-posten er allerede registrert.",
  WEAK_PASSWORD: "Passordet er for svakt. Velg et sterkere passord.",
  TOKEN_INVALID: "Lenken er ugyldig. Be om en ny tilbakestillingslenke.",
  TOKEN_EXPIRED: "Lenken har utløpt. Be om en ny tilbakestillingslenke.",
  UNAUTHORIZED: "Du må logge inn for å fortsette.",
  WORDPRESS_UNAVAILABLE: "Klarte ikke kontakte kontosystemet. Prøv igjen snart.",
  UNKNOWN_ERROR: DEFAULT_ERROR_MESSAGE,
};

export function getAuthErrorMessage(
  code?: AuthErrorCode,
  fallback?: string
): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (fallback?.trim()) return fallback.trim();
  return DEFAULT_ERROR_MESSAGE;
}

