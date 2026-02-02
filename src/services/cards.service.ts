import { api } from "./api";
import type {
  Card,
  CreateCardDTO,
  UpdateCardDTO,
  MoveCardDTO,
} from "@/types/card.types";

export const cardsService = {
  getByBoardId: async (boardId: string): Promise<Card[]> => {
    const { data } = await api.get<Card[]>(`/boards/${boardId}/cards`);
    return data;
  },

  create: async (payload: CreateCardDTO): Promise<Card> => {
    const { data } = await api.post<Card>("/cards", payload);
    return data;
  },

  update: async (id: string, payload: UpdateCardDTO): Promise<Card> => {
    const { data } = await api.put<Card>(`/cards/${id}`, payload);
    return data;
  },

  move: async (id: string, payload: MoveCardDTO): Promise<Card> => {
    const { data } = await api.patch<Card>(`/cards/${id}/move`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },
};
