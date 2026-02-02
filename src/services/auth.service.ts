import { api } from "./api";
import type { LoginDTO, RegisterDTO, AuthResponse } from "@/types/auth.types";

export const authService = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  register: async (payload: RegisterDTO): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });
    return data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/refresh");
    return data;
  },
};
