import { createHash } from "node:crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Compare secrets via fixed-length SHA-256 digests to reduce timing leakage
 * from unequal string lengths. Digests are hex strings of equal length.
 */
export function secretsMatchBySha256(
  incomingSecret: string | null | undefined,
  configuredSecret: string | null | undefined
): boolean {
  if (!incomingSecret || !configuredSecret) return false;
  return sha256Hex(incomingSecret) === sha256Hex(configuredSecret);
}

/** Headers accepted by product revalidation webhooks. */
export function getRevalidateHeaderSecret(request: Request): string | null {
  return (
    request.headers.get("x-revalidate-secret") ??
    request.headers.get("x-webhook-secret") ??
    null
  );
}

/** Headers accepted by search-index rebuild webhooks. */
export function getSearchIndexRebuildHeaderSecret(request: Request): string | null {
  return (
    request.headers.get("x-revalidate-secret") ??
    request.headers.get("x-search-index-secret") ??
    null
  );
}

export function isRevalidateAuthorized(
  request: Request,
  configuredSecret: string | null | undefined
): boolean {
  return secretsMatchBySha256(getRevalidateHeaderSecret(request), configuredSecret);
}

export function isSearchIndexRebuildAuthorized(
  request: Request,
  configuredSecret: string | null | undefined
): boolean {
  return secretsMatchBySha256(
    getSearchIndexRebuildHeaderSecret(request),
    configuredSecret
  );
}
