"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "zustand";
import type { SessionUser } from "@/lib/auth/types";
import { useLogoutMutation } from "@/lib/tanstack/auth-queries";
import { queryKeys } from "@/lib/tanstack/query-keys";
import {
  createAuthStore,
  type AuthStore,
  type AuthStoreApi,
  type AuthView,
} from "@/stores/auth-store";

const AccountAuthStoreContext = createContext<AuthStoreApi | null>(null);

type AccountAuthProviderProps = {
  children: ReactNode;
  initialUser: SessionUser | null;
};

export function AccountAuthProvider({
  children,
  initialUser,
}: AccountAuthProviderProps) {
  const [store] = useState<AuthStoreApi>(() => createAuthStore({ user: initialUser }));

  return (
    <AccountAuthStoreContext.Provider value={store}>
      {children}
    </AccountAuthStoreContext.Provider>
  );
}

function useAccountAuthStore<T>(selector: (state: AuthStore) => T): T {
  const store = useContext(AccountAuthStoreContext);
  if (!store) {
    throw new Error("useAuth must be used within AccountAuthProvider");
  }
  return useStore(store, selector);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const user = useAccountAuthStore((state) => state.user);
  const authenticated = useAccountAuthStore((state) => state.authenticated);
  const authView = useAccountAuthStore((state) => state.authView);
  const logoutPending = useAccountAuthStore((state) => state.logoutPending);
  const setAuthView = useAccountAuthStore((state) => state.setAuthView);
  const setAuthenticatedUser = useAccountAuthStore(
    (state) => state.setAuthenticatedUser
  );
  const clearAuthenticatedUser = useAccountAuthStore(
    (state) => state.clearAuthenticatedUser
  );
  const setLogoutPending = useAccountAuthStore(
    (state) => state.setLogoutPending
  );

  const logout = useCallback(async () => {
    if (logoutPending || logoutMutation.isPending) return;
    setLogoutPending(true);
    try {
      await logoutMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    } finally {
      clearAuthenticatedUser();
      setLogoutPending(false);
    }
  }, [
    clearAuthenticatedUser,
    logoutMutation,
    logoutPending,
    queryClient,
    setLogoutPending,
  ]);

  const loginSuccess = useCallback(
    (nextUser: SessionUser) => {
      setAuthenticatedUser(nextUser);
    },
    [setAuthenticatedUser]
  );

  const signupSuccess = useCallback(
    (nextUser: SessionUser) => {
      setAuthenticatedUser(nextUser);
    },
    [setAuthenticatedUser]
  );

  return {
    user,
    authenticated,
    authView,
    logoutPending,
    setAuthView: (view: AuthView) => setAuthView(view),
    loginSuccess,
    signupSuccess,
    clearAuthenticatedUser,
    logout,
  };
}
