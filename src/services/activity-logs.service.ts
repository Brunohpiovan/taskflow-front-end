import { api } from "@/lib/api";
import { User } from "./comments.service";

export interface ActivityLog {
    id: string;
    action: string;
    details?: string;
    cardId: string;
    userId: string;
    createdAt: string;
    user: User;
}

export const activityLogsService = {
    getByCardId: async (cardId: string): Promise<ActivityLog[]> => {
        const response = await api.get("/activity-logs", {
            params: { cardId },
        });
        const result = response.data;
        return Array.isArray(result) ? result : (result.data || []);
    },
};
