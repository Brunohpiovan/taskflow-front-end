"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { STORAGE_KEYS } from "@/lib/constants";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=${token}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  } else {
    document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=; path=/; max-age=0`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    if (token) {
      setAuthCookie(token);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkAuth().catch(() => {});
    }
  }, [token, checkAuth]);

  return <>{children}</>;
}
