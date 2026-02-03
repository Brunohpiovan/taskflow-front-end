import { api } from "./api";
import type {
  Environment,
  CreateEnvironmentDTO,
  UpdateEnvironmentDTO,
} from "@/types/environment.types";

export const environmentsService = {
  getAllDashboard: async (): Promise<Environment[]> => {
    const { data } = await api.get<Environment[]>("/environments/dashboard");
    return data;
  },

  getAll: async (): Promise<Environment[]> => {
    const { data } = await api.get<Environment[]>("/environments");
    return data;
  },

  getById: async (id: string): Promise<Environment> => {
    const { data } = await api.get<Environment>(`/environments/${id}`);
    return data;
  },

  create: async (payload: CreateEnvironmentDTO): Promise<Environment> => {
    const { data } = await api.post<Environment>("/environments", payload);
    return data;
  },

  update: async (id: string, payload: UpdateEnvironmentDTO): Promise<Environment> => {
    const { data } = await api.put<Environment>(`/environments/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/environments/${id}`);
  },
};
