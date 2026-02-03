import { api } from "@/lib/api";

export interface User {
    id: string;
    name: string;
    avatar?: string;
}

export interface Comment {
    id: string;
    content: string;
    cardId: string;
    userId: string;
    createdAt: string;
    user: User;
}

export interface CreateCommentDTO {
    content: string;
    cardId: string;
}

export const commentsService = {
    getByCardId: async (cardId: string): Promise<Comment[]> => {
        const response = await api.get("/comments", {
            params: { cardId },
        });
        // Backend retorna { data: [...] }, mas Axios já extrai response.data
        // então precisamos pegar response.data.data ou response.data dependendo da estrutura
        const result = response.data;
        return Array.isArray(result) ? result : (result.data || []);
    },

    create: async (dto: CreateCommentDTO): Promise<Comment> => {
        const response = await api.post("/comments", dto);
        const result = response.data;
        return result.data || result;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/comments/${id}`);
    },
};
