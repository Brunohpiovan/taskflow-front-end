import { api } from "./api";
import type {
  Card,
  CreateCardDTO,
  UpdateCardDTO,
  MoveCardDTO,
  MoveCardResponse,
} from "@/types/card.types";

export const cardsService = {
  getByBoardId: async (boardId: string): Promise<Card[]> => {
    const { data } = await api.get<Card[]>(`/boards/${boardId}/cards`);
    return data;
  },

  getCalendarCards: async (environmentId: string): Promise<Card[]> => {
    const { data } = await api.get<Card[]>(`/cards/calendar?environmentId=${environmentId}`);
    return data;
  },

  getById: async (id: string): Promise<Card> => {
    const { data } = await api.get<Card>(`/cards/${id}`);
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

  move: async (id: string, payload: MoveCardDTO): Promise<MoveCardResponse> => {
    const { data } = await api.patch<MoveCardResponse>(`/cards/${id}/move`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },

  // Card Members
  getCardMembers: async (cardId: string) => {
    const { data } = await api.get(`/cards/${cardId}/members`);
    return data;
  },

  addCardMember: async (cardId: string, userId: string) => {
    const { data } = await api.post(`/cards/${cardId}/members`, { userId });
    return data;
  },

  removeCardMember: async (cardId: string, userId: string) => {
    await api.delete(`/cards/${cardId}/members/${userId}`);
  },
};
