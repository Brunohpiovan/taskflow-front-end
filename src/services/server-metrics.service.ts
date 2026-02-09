import { serverApi } from "./server-api";
import type { MetricsResponse } from "@/types/metrics.types";

export const serverMetricsService = {
    getMetrics: async (): Promise<MetricsResponse> => {
        return serverApi.get<MetricsResponse>("/metrics");
    },
};
