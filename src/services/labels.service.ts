import { api } from "@/lib/api";
import { Label } from "@/types/card.types";

export interface CreateLabelDTO {
    name: string;
    color: string;
    boardId: string;
}

export interface UpdateLabelDTO {
    name?: string;
    color?: string;
}

export const labelsService = {
    getByBoardId: async (boardId: string): Promise<Label[]> => {
        const response = await api.get("/labels", {
            params: { boardId },
        });
        const result = response.data;
        return Array.isArray(result) ? result : (result.data || []);
    },

    create: async (dto: CreateLabelDTO): Promise<Label> => {
        const response = await api.post("/labels", dto);
        const result = response.data;
        return result.data || result;
    },

    update: async (id: string, dto: UpdateLabelDTO): Promise<Label> => {
        const { data } = await api.patch<Label>(`/labels/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/labels/${id}`);
    },
};
