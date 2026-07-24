import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AccountAuthProvider } from "@/components/account/account-auth-provider";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getWordpressCurrentUser } from "@/lib/auth/wordpress-auth-client";

async function getInitialUser() {
  const cookieStore = await cookies();
  const session = getSessionFromCookies(cookieStore);
  if (!session) return null;

  const me = await getWordpressCurrentUser(session.token);
  if (!me.ok || !me.user) return null;
  return me.user;
}

export default async function MinKontoLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const initialUser = await getInitialUser();

  return <AccountAuthProvider initialUser={initialUser}>{children}</AccountAuthProvider>;
}
