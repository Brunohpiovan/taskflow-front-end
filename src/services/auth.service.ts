import { api } from "./api";
import type {
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  User,
  UpdateProfileDTO,
} from "@/types/auth.types";

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

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  updateProfile: async (payload: UpdateProfileDTO): Promise<User> => {
    const { data } = await api.put<User>("/auth/me", payload);
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, password });
  },
};
