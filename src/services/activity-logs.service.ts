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

export interface PaginatedActivityLogs {
    data: ActivityLog[];
    nextCursor: string | null;
}

export const activityLogsService = {
    getByCardId: async (
        cardId: string,
        cursor?: string,
        limit = 10,
    ): Promise<PaginatedActivityLogs> => {
        const response = await api.get("/activity-logs", {
            params: { cardId, cursor, limit },
        });
        const result = response.data;
        // The ResponseTransformInterceptor passes objects with a 'data' key directly.
        // So the structure is: response.data = { data: [...logs], nextCursor: "..." }
        if (result && Array.isArray(result.data) && 'nextCursor' in result) {
            return result as PaginatedActivityLogs;
        }
        // Legacy fallback (plain array)
        const items = Array.isArray(result) ? result : (result.data || []);
        return { data: items, nextCursor: null };
    },
};
