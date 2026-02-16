import { create } from "zustand";
import { environmentsService } from "@/services/environments.service";
import { handleApiError } from "@/lib/api-error-handler";
import type {
  Environment,
  CreateEnvironmentDTO,
  UpdateEnvironmentDTO,
} from "@/types/environment.types";

interface EnvironmentsState {
  environments: Environment[];
  currentEnvironment: Environment | null;
  isLoading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  fetchDashboardEnvironments: () => Promise<void>;
  createEnvironment: (data: CreateEnvironmentDTO) => Promise<Environment>;
  updateEnvironment: (id: string, data: UpdateEnvironmentDTO) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  simpleEnvironments: { id: string; name: string; slug: string }[];
  fetchSimpleEnvironments: () => Promise<void>;
  setCurrentEnvironment: (env: Environment | null) => void;
}

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
  environments: [],
  currentEnvironment: null,
  isLoading: false,
  error: null,

  fetchEnvironments: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const environments = await environmentsService.getAll();
      set({ environments, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  fetchDashboardEnvironments: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const environments = await environmentsService.getAllDashboard();
      set({ environments, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  createEnvironment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const environment = await environmentsService.create(data);
      set((state) => ({
        environments: [...state.environments, environment],
        isLoading: false,
      }));
      return environment;
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  updateEnvironment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const environment = await environmentsService.update(id, data);
      set((state) => ({
        environments: state.environments.map((e) => (e.id === id ? environment : e)),
        currentEnvironment:
          state.currentEnvironment?.id === id ? environment : state.currentEnvironment,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  deleteEnvironment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await environmentsService.delete(id);
      set((state) => ({
        environments: state.environments.filter((e) => e.id !== id),
        currentEnvironment: state.currentEnvironment?.id === id ? null : state.currentEnvironment,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  simpleEnvironments: [],
  simpleEnvironments: [],
  fetchSimpleEnvironments: async () => {
    if (get().simpleEnvironments.length > 0 || get().isLoading) return;
    set({ isLoading: true });
    try {
      const simpleEnvironments = await environmentsService.getSimple();
      set({ simpleEnvironments, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch simple environments", error);
      set({ isLoading: false });
    }
  },

  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),
}));
