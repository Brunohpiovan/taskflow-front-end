import { api } from "./api";
import type { Board, CreateBoardDTO, UpdateBoardDTO } from "@/types/board.types";

export const boardsService = {
  getByEnvironmentId: async (environmentId: string): Promise<Board[]> => {
    const { data } = await api.get<Board[]>(`/environments/${environmentId}/boards`);
    return data;
  },

  create: async (payload: CreateBoardDTO): Promise<Board> => {
    const { data } = await api.post<Board>("/boards", payload);
    return data;
  },

  update: async (id: string, payload: UpdateBoardDTO): Promise<Board> => {
    const { data } = await api.put<Board>(`/boards/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};
