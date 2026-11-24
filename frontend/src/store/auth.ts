// Auth store: session state, backed by a localStorage token. In guest mode
// (auth_required=false) the app works with no login; in shared mode, routes are
// protected and 401s redirect to /login.
import { create } from "zustand";
import { api } from "../api";
import type { AuthUser } from "../types";
import { getToken, setToken, clearToken } from "../lib/authToken";

interface AuthState {
  authRequired: boolean;
  user: AuthUser | null;
  ready: boolean; // config + session resolved
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  onUnauthorized: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  authRequired: false,
  user: null,
  ready: false,

  init: async () => {
    let authRequired = false;
    try {
      authRequired = (await api.authConfig()).auth_required;
    } catch {
      /* backend unreachable → treat as guest for UI */
    }
    let user: AuthUser | null = null;
    if (getToken()) {
      try {
        user = await api.me();
      } catch {
        clearToken();
      }
    }
    set({ authRequired, user, ready: true });
  },

  login: async (email, password) => {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    set({ user: res.user });
  },

  register: async (name, email, password) => {
    const res = await api.register({ name, email, password });
    setToken(res.access_token);
    set({ user: res.user });
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      /* best effort */
    }
    clearToken();
    set({ user: null });
  },

  onUnauthorized: () => {
    clearToken();
    set({ user: null });
    if (get().authRequired && !location.pathname.startsWith("/login")) {
      location.assign("/login");
    }
  },
}));
