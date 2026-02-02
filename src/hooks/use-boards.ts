import { useEffect } from "react";
import { useBoardsStore } from "@/stores/boards.store";

export function useBoards(environmentId: string | undefined) {
  const boards = useBoardsStore((s) => s.boards);
  const isLoading = useBoardsStore((s) => s.isLoading);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);
  const clearBoards = useBoardsStore((s) => s.clearBoards);

  useEffect(() => {
    if (environmentId) {
      fetchBoards(environmentId).catch(() => {});
      return () => clearBoards();
    }
  }, [environmentId, fetchBoards, clearBoards]);

  return {
    boards,
    isLoading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
