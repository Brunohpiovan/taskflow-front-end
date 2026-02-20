"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Always run checkAuth on mount so the session is restored
  // from the cookie even when Zustand state is empty (e.g. after F5).
  // The token is no longer persisted in localStorage, so we cannot
  // gate this call on `token` — it will be null until checkAuth runs.
  useEffect(() => {
    checkAuth().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  return <>{children}</>;
}
