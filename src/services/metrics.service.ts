import { api } from "@/lib/api";
import type { MetricsResponse } from "@/types/metrics.types";

export const metricsService = {
    async getMetrics(): Promise<MetricsResponse> {
        const response = await api.get<{ data: MetricsResponse }>("/metrics");
        // O backend retorna { data: { ... } }, então acessamos response.data.data
        return response.data.data;
    },
};
