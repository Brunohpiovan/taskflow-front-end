import { api } from "./api";
import type {
  Environment,
  EnvironmentMember,
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

  getBySlug: async (slug: string): Promise<Environment> => {
    const { data } = await api.get<Environment>(`/environments/slug/${slug}`);
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

  getMembers: async (id: string): Promise<EnvironmentMember[]> => {
    const { data } = await api.get<EnvironmentMember[]>(`/environments/${id}/members`);
    return data;
  },

  removeMember: async (id: string, memberId: string): Promise<void> => {
    await api.delete(`/environments/${id}/members/${memberId}`);
  },

  createInvite: async (id: string, email: string): Promise<void> => {
    await api.post(`/environments/${id}/invites`, { email });
  },

  acceptInvite: async (token: string): Promise<{ message: string; environmentSlug: string }> => {
    const { data } = await api.post(`/invites/accept`, { token });
    return data;
  },
};
