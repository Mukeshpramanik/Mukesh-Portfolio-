'use client';

import { create } from 'zustand';

export interface AdminUser {
  username: string;
  email?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  admin: AdminUser | null;
  isHydrated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  checkAuth: () => void;
}

const TOKEN_KEY = 'auth_token';
const ADMIN_KEY = 'admin_user';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  admin: null,
  isHydrated: false,

  login: (token: string, admin: AdminUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    }
    set({
      token,
      admin,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    }
    set({
      token: null,
      admin: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  checkAuth: () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true });
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const adminRaw = localStorage.getItem(ADMIN_KEY);

      if (token) {
        const admin = adminRaw ? JSON.parse(adminRaw) : { username: 'admin' };
        set({
          token,
          admin,
          isAuthenticated: true,
          isHydrated: true,
        });
      } else {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
          isHydrated: true,
        });
      }
    } catch {
      set({
        token: null,
        admin: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },
}));
