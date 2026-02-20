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
  /** Set of boardIds currently being fetched — enables per-board loading state */
  loadingBoards: Set<string>;
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
  syncCardMove: (cardId: string, fromBoardId: string, toBoardId: string, newIndex: number) => void;
  syncCardCreated: (card: Card) => void;
  syncCardUpdated: (card: Card) => void;
  syncCardDeleted: (cardId: string, boardId: string) => void;
  clearCards: () => void;
  isBoardLoading: (boardId: string) => boolean;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: {},
  loadingBoards: new Set<string>(),

  isBoardLoading: (boardId) => get().loadingBoards.has(boardId),

  fetchCards: async (boardId) => {
    const state = get();
    // Skip if already fetching this specific board
    if (state.loadingBoards.has(boardId)) return;

    set((state) => {
      const next = new Set(state.loadingBoards);
      next.add(boardId);
      return { loadingBoards: next };
    });
    try {
      const cards = await cardsService.getByBoardId(boardId);
      set((state) => {
        const next = new Set(state.loadingBoards);
        next.delete(boardId);
        return {
          cards: { ...state.cards, [boardId]: cards.sort((a, b) => a.position - b.position) },
          loadingBoards: next,
        };
      });
    } catch (error) {
      set((state) => {
        const next = new Set(state.loadingBoards);
        next.delete(boardId);
        return { loadingBoards: next };
      });
      handleApiError(error);
      throw error;
    }
  },

  createCard: async (data) => {
    try {
      const card = await cardsService.create(data);
      set((state) => {
        const boardCards = state.cards[data.boardId] ?? [];
        const newCards = [...boardCards, card].sort((a, b) => a.position - b.position);
        return {
          cards: { ...state.cards, [data.boardId]: newCards },
        };
      });
      return card;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateCard: async (id, data) => {
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
        return { cards: newCards };
      });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteCard: async (id) => {
    try {
      await cardsService.delete(id);
      set((state) => {
        const newCards = { ...state.cards };
        for (const boardId of Object.keys(newCards)) {
          newCards[boardId] = newCards[boardId].filter((c) => c.id !== id);
        }
        return { cards: newCards };
      });
    } catch (error) {
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

    // Optimistic update
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
      // Rollback optimistic update
      set({ cards: prevCards });
      handleApiError(error);
      throw error;
    }
  },

  setCardsForBoard: (boardId, cards) => {
    set((state) => ({
      cards: { ...state.cards, [boardId]: cards },
    }));
  },

  syncCardMove: (cardId, fromBoardId, toBoardId, newIndex) => {
    const prevCards = get().cards;
    const fromCards = prevCards[fromBoardId] ?? [];
    const card = fromCards.find((c) => c.id === cardId);

    if (!card) return;

    const sameBoard = fromBoardId === toBoardId;

    set((state) => {
      const newFrom = state.cards[fromBoardId]?.filter((c) => c.id !== cardId) ?? [];
      const updatedCard = { ...card, boardId: toBoardId };

      if (sameBoard) {
        const insertIndex = Math.min(newIndex, newFrom.length);
        const newTo = [...newFrom];
        newTo.splice(insertIndex, 0, updatedCard);
        const sorted = newTo.map((c, i) => ({ ...c, position: i }));
        return { cards: { ...state.cards, [fromBoardId]: sorted } };
      }

      const newTo = [...(state.cards[toBoardId] ?? [])];
      newTo.splice(newIndex, 0, updatedCard);

      const newToSorted = newTo.map((c, i) => ({ ...c, position: i }));
      const newFromSorted = newFrom.map((c, i) => ({ ...c, position: i }));

      return {
        cards: {
          ...state.cards,
          [fromBoardId]: newFromSorted,
          [toBoardId]: newToSorted,
        },
      };
    });
  },

  syncCardCreated: (card) => {
    set((state) => {
      const boardCards = state.cards[card.boardId] ?? [];
      // Avoid duplicate if already exists
      if (boardCards.some((c) => c.id === card.id)) return {};

      const newCards = [...boardCards, card].sort((a, b) => a.position - b.position);
      return { cards: { ...state.cards, [card.boardId]: newCards } };
    });
  },

  syncCardUpdated: (card) => {
    set((state) => {
      const boardCards = state.cards[card.boardId];
      if (!boardCards) return {};

      const idx = boardCards.findIndex((c) => c.id === card.id);
      if (idx === -1) return {};

      const newCards = [...boardCards];
      newCards[idx] = { ...newCards[idx], ...card };
      return { cards: { ...state.cards, [card.boardId]: newCards } };
    });
  },

  syncCardDeleted: (cardId, boardId) => {
    set((state) => {
      const boardCards = state.cards[boardId];
      if (!boardCards) return {};

      const newCards = boardCards.filter((c) => c.id !== cardId);
      return { cards: { ...state.cards, [boardId]: newCards } };
    });
  },

  clearCards: () => set({ cards: {}, loadingBoards: new Set() }),
}));
