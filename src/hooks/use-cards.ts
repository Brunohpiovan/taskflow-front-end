import { useEffect } from "react";
import { useCardsStore } from "@/stores/cards.store";

export function useCards(boardId: string | undefined) {
  const cards = useCardsStore((s) => s.cards[boardId ?? ""] ?? []);
  const isLoading = useCardsStore((s) => s.isBoardLoading(boardId ?? ""));
  const fetchCards = useCardsStore((s) => s.fetchCards);
  const createCard = useCardsStore((s) => s.createCard);
  const updateCard = useCardsStore((s) => s.updateCard);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const moveCard = useCardsStore((s) => s.moveCard);

  useEffect(() => {
    if (boardId) fetchCards(boardId).catch(() => { });
  }, [boardId, fetchCards]);

  return {
    cards,
    isLoading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  };
}
