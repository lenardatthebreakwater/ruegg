import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { SessionUser } from "@/lib/auth/types";

const SESSION_COOKIE_NAME = "pb_auth_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const ALGORITHM = "aes-256-gcm";

type SessionPayload = {
  token: string;
  expiresAt: number;
  user: SessionUser;
};

function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }
  return secret;
}

function getSessionKey(): Buffer {
  return createHash("sha256").update(getSessionSecret()).digest();
}

function toBase64Url(value: Buffer): string {
  return value.toString("base64url");
}

function fromBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function buildSessionPayload(
  token: string,
  user: SessionUser,
  expiresInSeconds?: number
): SessionPayload {
  const ttl = Number.isFinite(expiresInSeconds) && (expiresInSeconds ?? 0) > 0
    ? Math.floor(expiresInSeconds as number)
    : SESSION_LIFETIME_SECONDS;

  return {
    token,
    user,
    expiresAt: Math.floor(Date.now() / 1000) + ttl,
  };
}

export function encodeSessionPayload(payload: SessionPayload): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getSessionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [toBase64Url(iv), toBase64Url(encrypted), toBase64Url(authTag)].join(".");
}

export function decodeSessionPayload(value: string): SessionPayload | null {
  try {
    const [ivPart, encryptedPart, tagPart] = value.split(".");
    if (!ivPart || !encryptedPart || !tagPart) return null;

    const decipher = createDecipheriv(ALGORITHM, getSessionKey(), fromBase64Url(ivPart));
    decipher.setAuthTag(fromBase64Url(tagPart));
    const plaintext = Buffer.concat([
      decipher.update(fromBase64Url(encryptedPart)),
      decipher.final(),
    ]);
    const parsed = JSON.parse(plaintext.toString("utf8")) as SessionPayload;
    if (!parsed?.token || !parsed?.user || !parsed?.expiresAt) return null;
    if (parsed.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionCookie(
  cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void },
  payload: SessionPayload
): void {
  cookies.set(SESSION_COOKIE_NAME, encodeSessionPayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(1, payload.expiresAt - Math.floor(Date.now() / 1000)),
  });
}

export function clearSessionCookie(
  cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void }
): void {
  cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionFromCookies(cookies: {
  get: (name: string) => { value: string } | undefined;
}): SessionPayload | null {
  const value = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!value) return null;
  return decodeSessionPayload(value);
}

