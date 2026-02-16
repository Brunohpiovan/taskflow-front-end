export const APP_NAME = "TaskFlow";

/** URL base da API (para redirects OAuth no client) */
export const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api");

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  AUTH_CALLBACK: "/auth/callback",
  DASHBOARD: "/dashboard",
  ENVIRONMENTS: "/environments",
  ENVIRONMENT: (slug: string) => `/environments/${slug}`,
  BOARD: (envSlug: string, boardSlug: string) => `/environments/${envSlug}/boards/${boardSlug}`,
  MY_DATA: "/meus-dados",
  METRICS: "/metricas",
  CALENDAR: "/calendar",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  AUTH_STORAGE: "auth-storage",
} as const;

/** Limite de caracteres na descrição do card (backend e frontend) */
export const CARD_DESCRIPTION_MAX_LENGTH = 500;
