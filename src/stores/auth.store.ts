import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/lib/api-error-handler";
import type { User, LoginDTO, RegisterDTO } from "@/types/auth.types";
import { STORAGE_KEYS } from "@/lib/constants";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=${token}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  } else {
    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=; path=/; max-age=0`;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
  register: (data: RegisterDTO) => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.login(credentials);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          handleApiError(error);
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.register(data);
          setAuthCookie(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          handleApiError(error);
          throw error;
        }
      },

      setUser: (user) => set({ user }),

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const { user } = await authService.refresh();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORAGE,
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
