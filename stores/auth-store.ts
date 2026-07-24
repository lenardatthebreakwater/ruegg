"use client";

import { createStore } from "zustand/vanilla";
import type { SessionUser } from "@/lib/auth/types";

export type AuthView = "login" | "signup";

type AuthState = {
  user: SessionUser | null;
  authenticated: boolean;
  authView: AuthView;
  logoutPending: boolean;
  hasInitializedFromServer: boolean;
};

type AuthActions = {
  initializeFromUser: (user: SessionUser | null) => void;
  setAuthView: (view: AuthView) => void;
  setAuthenticatedUser: (user: SessionUser) => void;
  clearAuthenticatedUser: () => void;
  setLogoutPending: (pending: boolean) => void;
};

export type AuthStore = AuthState & AuthActions;
export type AuthStoreApi = ReturnType<typeof createAuthStore>;

const defaultInitState: AuthState = {
  user: null,
  authenticated: false,
  authView: "login",
  logoutPending: false,
  hasInitializedFromServer: false,
};

type CreateAuthStoreOptions = {
  user?: SessionUser | null;
};

export function createAuthStore(options: CreateAuthStoreOptions = {}) {
  const initialUser = options.user ?? null;

  return createStore<AuthStore>()((set) => ({
    ...defaultInitState,
    user: initialUser,
    authenticated: Boolean(initialUser),
    hasInitializedFromServer: true,
    initializeFromUser: (user) =>
      set((state) => {
        if (state.hasInitializedFromServer) return state;
        return {
          user,
          authenticated: Boolean(user),
          hasInitializedFromServer: true,
        };
      }),
    setAuthView: (view) => set({ authView: view }),
    setAuthenticatedUser: (user) =>
      set({
        user,
        authenticated: true,
      }),
    clearAuthenticatedUser: () =>
      set({
        user: null,
        authenticated: false,
      }),
    setLogoutPending: (pending) => set({ logoutPending: pending }),
  }));
}
