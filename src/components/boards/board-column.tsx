"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ListTodo, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "@/components/cards/task-card";
import { CardForm } from "@/components/cards/card-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCardsStore } from "@/stores/cards.store";
import { useBoardsStore } from "@/stores/boards.store";
import type { Board } from "@/types/board.types";
import type { Card as CardType } from "@/types/card.types";
import { useState } from "react";
import { toast } from "sonner";

interface BoardColumnProps {
  board: Board;
  cards: CardType[];
}

export function BoardColumn({ board, cards }: BoardColumnProps) {
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: board.id });

  const createCard = useCardsStore((s) => s.createCard);
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);

  const handleCreateCard = async (title: string, description?: string) => {
    await createCard({
      title,
      description,
      boardId: board.id,
      position: cards.length,
    });
    toast.success("Card criado.");
    setCardFormOpen(false);
  };

  const handleDeleteBoard = async () => {
    await deleteBoard(board.id);
    toast.success("Quadro excluído.");
    setConfirmDeleteOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={
        "shrink-0 w-72 rounded-lg border bg-muted/30 transition-all duration-200 min-h-[280px] " +
        (isOver
          ? "ring-2 ring-primary bg-primary/10 border-primary/50 shadow-lg"
          : "")
      }
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <ListTodo className="h-4 w-4 shrink-0 text-muted-foreground" />
            <h3 className="font-semibold truncate">{board.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menu do quadro</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setConfirmDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir quadro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-2 overflow-hidden p-2">
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <TaskCard key={card.id} card={card} />
            ))}
          </SortableContext>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setCardFormOpen(true)}
          >
            + Adicionar card
          </Button>
        </CardContent>
      </Card>

      <CardForm
        open={cardFormOpen}
        onOpenChange={setCardFormOpen}
        onSubmit={handleCreateCard}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir quadro"
        description={"Tem certeza que deseja excluir o quadro \"" + board.name + "\"? Todos os cards serão removidos."}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteBoard}
      />
    </div>
  );
}
