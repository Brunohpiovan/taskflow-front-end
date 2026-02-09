import { create } from "zustand";
import { metricsService } from "@/services/metrics.service";
import { handleApiError } from "@/lib/api-error-handler";
import type { MetricsResponse } from "@/types/metrics.types";

interface MetricsState {
    metrics: MetricsResponse | null;
    isLoading: boolean;
    error: string | null;
    fetchMetrics: () => Promise<void>;
    clearMetrics: () => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
    metrics: null,
    isLoading: false,
    error: null,

    fetchMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
            const metrics = await metricsService.getMetrics();
            set({ metrics, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: "Erro ao carregar métricas" });
            handleApiError(error);
            throw error;
        }
    },

    clearMetrics: () => set({ metrics: null, error: null }),
}));
