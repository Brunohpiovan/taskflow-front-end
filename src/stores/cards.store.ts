import { create } from "zustand";
import { cardsService } from "@/services/cards.service";
import { handleApiError } from "@/lib/api-error-handler";
import type {
  Card,
  CreateCardDTO,
  UpdateCardDTO,
} from "@/types/card.types";

interface CardsState {
  cards: Record<string, Card[]>;
  isLoading: boolean;
  fetchCards: (boardId: string) => Promise<void>;
  createCard: (data: CreateCardDTO) => Promise<Card>;
  updateCard: (id: string, data: UpdateCardDTO) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (
    cardId: string,
    fromBoardId: string,
    toBoardId: string,
    newIndex: number
  ) => Promise<void>;
  setCardsForBoard: (boardId: string, cards: Card[]) => void;
  clearCards: () => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: {},
  isLoading: false,

  fetchCards: async (boardId) => {
    set((state) => ({ cards: { ...state.cards }, isLoading: true }));
    try {
      const cards = await cardsService.getByBoardId(boardId);
      set((state) => ({
        cards: { ...state.cards, [boardId]: cards.sort((a, b) => a.position - b.position) },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  createCard: async (data) => {
    set({ isLoading: true });
    try {
      const card = await cardsService.create(data);
      set((state) => {
        const boardCards = state.cards[data.boardId] ?? [];
        const newCards = [...boardCards, card].sort((a, b) => a.position - b.position);
        return {
          cards: { ...state.cards, [data.boardId]: newCards },
          isLoading: false,
        };
      });
      return card;
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  updateCard: async (id, data) => {
    set({ isLoading: true });
    try {
      const card = await cardsService.update(id, data);
      set((state) => {
        const newCards = { ...state.cards };
        for (const boardId of Object.keys(newCards)) {
          const idx = newCards[boardId].findIndex((c) => c.id === id);
          if (idx >= 0) {
            newCards[boardId] = newCards[boardId].map((c) => (c.id === id ? card : c));
            break;
          }
        }
        return { cards: newCards, isLoading: false };
      });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  deleteCard: async (id) => {
    set({ isLoading: true });
    try {
      await cardsService.delete(id);
      set((state) => {
        const newCards = { ...state.cards };
        for (const boardId of Object.keys(newCards)) {
          newCards[boardId] = newCards[boardId].filter((c) => c.id !== id);
        }
        return { cards: newCards, isLoading: false };
      });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  moveCard: async (cardId, fromBoardId, toBoardId, newIndex) => {
    const prevCards = get().cards;
    const fromCards = prevCards[fromBoardId] ?? [];
    const card = fromCards.find((c) => c.id === cardId);
    if (!card) return;

    const sameBoard = fromBoardId === toBoardId;

    set((state) => {
      const newFrom = state.cards[fromBoardId]?.filter((c) => c.id !== cardId) ?? [];
      if (sameBoard) {
        const insertIndex = Math.min(newIndex, newFrom.length);
        const newTo = [...newFrom];
        newTo.splice(insertIndex, 0, { ...card, boardId: toBoardId });
        return { cards: { ...state.cards, [fromBoardId]: newTo } };
      }
      const newTo = [...(state.cards[toBoardId] ?? [])];
      newTo.splice(newIndex, 0, { ...card, boardId: toBoardId });
      return {
        cards: {
          ...state.cards,
          [fromBoardId]: newFrom,
          [toBoardId]: newTo,
        },
      };
    });

    try {
      const updated = await cardsService.move(cardId, {
        targetBoardId: toBoardId,
        newPosition: newIndex,
      });
      set((state) => {
        const newCards = { ...state.cards };
        const toList = newCards[toBoardId] ?? [];
        const idx = toList.findIndex((c) => c.id === cardId);
        if (idx >= 0) {
          toList[idx] = { ...toList[idx], ...updated };
          newCards[toBoardId] = toList;
        }
        return { cards: newCards };
      });
    } catch (error) {
      set({
        cards: prevCards,
      });
      handleApiError(error);
      throw error;
    }
  },

  setCardsForBoard: (boardId, cards) => {
    set((state) => ({
      cards: { ...state.cards, [boardId]: cards },
    }));
  },

  clearCards: () => set({ cards: {} }),
}));
