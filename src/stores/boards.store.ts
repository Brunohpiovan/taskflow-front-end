import { create } from "zustand";
import { boardsService } from "@/services/boards.service";
import { handleApiError } from "@/lib/api-error-handler";
import type { Board, CreateBoardDTO, UpdateBoardDTO } from "@/types/board.types";

interface BoardsState {
  boards: Board[];
  isLoading: boolean;
  fetchBoards: (environmentId: string) => Promise<void>;
  createBoard: (data: CreateBoardDTO) => Promise<Board>;
  updateBoard: (id: string, data: UpdateBoardDTO) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  reorderBoards: (boards: Board[]) => void;
  clearBoards: () => void;
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  isLoading: false,

  fetchBoards: async (environmentId) => {
    set({ isLoading: true });
    try {
      const boards = await boardsService.getByEnvironmentId(environmentId);
      set({ boards, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  createBoard: async (data) => {
    set({ isLoading: true });
    try {
      const board = await boardsService.create(data);
      set((state) => ({
        boards: [...state.boards, board].sort((a, b) => a.position - b.position),
        isLoading: false,
      }));
      return board;
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  updateBoard: async (id, data) => {
    set({ isLoading: true });
    try {
      const board = await boardsService.update(id, data);
      set((state) => ({
        boards: state.boards.map((b) => (b.id === id ? board : b)).sort((a, b) => a.position - b.position),
        isLoading: false,
      }));
      return board;
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  deleteBoard: async (id) => {
    set({ isLoading: true });
    try {
      await boardsService.delete(id);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      handleApiError(error);
      throw error;
    }
  },

  reorderBoards: (boards) => set({ boards }),

  clearBoards: () => set({ boards: [] }),
}));
