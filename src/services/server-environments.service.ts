import { serverApi } from "./server-api";
import type { Environment } from "@/types/environment.types";

export const serverEnvironmentsService = {
    getAllDashboard: async (): Promise<Environment[]> => {
        return serverApi.get<Environment[]>("/environments/dashboard");
    },
};
