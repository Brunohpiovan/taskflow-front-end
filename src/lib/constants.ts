export const APP_NAME = "TaskFlow";

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ENVIRONMENTS: "/environments",
  ENVIRONMENT: (id: string) => `/environments/${id}`,
  BOARD: (envId: string, boardId: string) => `/environments/${envId}/boards/${boardId}`,
  MY_DATA: "/meus-dados",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  AUTH_STORAGE: "auth-storage",
} as const;

/** Limite de caracteres na descrição do card (backend e frontend) */
export const CARD_DESCRIPTION_MAX_LENGTH = 500;
