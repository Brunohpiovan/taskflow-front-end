"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ListTodo, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskCard } from "@/components/cards/task-card";
import { CardForm } from "@/components/cards/card-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCardsStore } from "@/stores/cards.store";
import { useBoardsStore } from "@/stores/boards.store";
import type { Board } from "@/types/board.types";
import type { Card as CardType } from "@/types/card.types";
import type { EnvironmentMember } from "@/types/environment.types";
import { useState, memo, useEffect } from "react";
import { toast } from "sonner";
import { boardSchema } from "@/lib/validations";
import { environmentsService } from "@/services/environments.service";

interface BoardColumnProps {
  board: Board;
  cards: CardType[];
}

// Inner component to isolate re-renders of the content list
const BoardColumnContent = memo(function BoardColumnContent({
  board,
  cards,
  onAddCard,
  onEditName,
  onDeleteBoard
}: {
  board: Board;
  cards: CardType[];
  onAddCard: () => void;
  onEditName: () => void;
  onDeleteBoard: () => void;
}) {
  return (
    <Card className="h-full flex flex-col rounded-xl border-0 bg-card/80 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-3 space-y-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-icon">
            <ListTodo className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate text-foreground">{board.name}</h3>
            <p className="text-xs text-muted-foreground tabular-nums">
              {cards.length} {cards.length === 1 ? "card" : "cards"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg opacity-70 hover:opacity-100 hover:bg-muted"
              aria-label="Menu do quadro"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onAddCard}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditName}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar nome
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDeleteBoard}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir quadro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-0">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
        <Button
          variant="ghost"
          className="mt-1 w-full justify-start rounded-lg border border-dashed border-border/80 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
          onClick={onAddCard}
        >
          + Adicionar card
        </Button>
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  if (prev.board.id !== next.board.id) return false;
  if (prev.board.name !== next.board.name) return false;
  // Shallow compare cards
  if (prev.cards === next.cards) return true;
  if (prev.cards.length !== next.cards.length) return false;
  // Deep check if cards changed - needed because dragging changes order but not necessarily length
  // However, simple reference equality check on cards array is usually enough if store is immutable
  // But let's be safe for drag scenarios
  return prev.cards.every((c, i) => c === next.cards[i]);
});

export const BoardColumn = memo(function BoardColumn({ board, cards }: BoardColumnProps) {
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState(board.name);
  const [editNameLoading, setEditNameLoading] = useState(false);
  const [environmentMembers, setEnvironmentMembers] = useState<EnvironmentMember[]>([]);

  // OPTIMIZATION: Use local useDroppable state instead of global useDndContext
  // This prevents the entire column (and its children) from re-rendering just because
  // the user is dragging something somewhere else on the screen.
  // The 'isOver' prop here only updates for THIS specific column.
  const { setNodeRef, isOver } = useDroppable({
    id: board.id,
    data: {
      type: "Board",
      board
    }
  });

  const createCard = useCardsStore((s) => s.createCard);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);

  useEffect(() => {
    if (board.environmentId) {
      environmentsService.getMembers(board.environmentId)
        .then(setEnvironmentMembers)
        .catch(() => setEnvironmentMembers([]));
    }
  }, [board.environmentId]);

  const handleCreateCard = async (title: string, description?: string, dueDate?: string, labels?: string[], members?: string[]) => {
    await createCard({
      title,
      description,
      dueDate,
      boardId: board.id,
      position: cards.length,
      labels,
      members,
    });
    toast.success("Card criado.");
    setCardFormOpen(false);
  };

  const handleEditNameOpen = (open: boolean) => {
    setEditNameOpen(open);
    if (open) setEditNameValue(board.name);
  };

  const handleEditNameSubmit = async () => {
    const result = boardSchema.pick({ name: true }).safeParse({ name: editNameValue?.trim() });
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.name?.[0] ?? "Nome inválido.";
      toast.error(msg);
      return;
    }
    const name = result.data.name;
    if (name === board.name) {
      toast.info("Nenhuma alteração realizada.");
      setEditNameOpen(false);
      return;
    }
    setEditNameLoading(true);
    try {
      await updateBoard(board.id, { name });
      toast.success("Nome do quadro atualizado.");
      setEditNameOpen(false);
    } catch {
      // erro já tratado no store
    } finally {
      setEditNameLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    await deleteBoard(board.id);
    toast.success("Quadro excluído.");
    setConfirmDeleteOpen(false);
  };

  const confirmDeleteDescription =
    "Tem certeza que deseja excluir o quadro " + board.name + "? Todos os cards serão removidos.";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 w-[288px] ml-2 rounded-xl transition-all duration-200 min-h-[620px] max-h-[630px] border",
        isOver
          ? "bg-muted/60 border-primary/20 ring-2 ring-primary/20 shadow-md"
          : "bg-secondary/50 border-border/80 hover:border-border hover:bg-secondary/70 shadow-sm"
      )}
    >
      <BoardColumnContent
        board={board}
        cards={cards}
        onAddCard={() => setCardFormOpen(true)}
        onEditName={() => handleEditNameOpen(true)}
        onDeleteBoard={() => setConfirmDeleteOpen(true)}
      />

      {cardFormOpen && (
        <CardForm
          open={cardFormOpen}
          onOpenChange={setCardFormOpen}
          onSubmit={handleCreateCard}
          boardId={board.id}
          environmentId={board.environmentId}
          environmentMembers={environmentMembers}
        />
      )}

      {confirmDeleteOpen && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Excluir quadro"
          description={confirmDeleteDescription}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="destructive"
          onConfirm={handleDeleteBoard}
        />
      )}

      {editNameOpen && (
        <Dialog open={editNameOpen} onOpenChange={handleEditNameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar nome do quadro</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="board-name">Nome</Label>
              <Input
                id="board-name"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                placeholder="Ex.: To Do"
                disabled={editNameLoading}
                onKeyDown={(e) => e.key === "Enter" && handleEditNameSubmit()}
              />
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditNameOpen(false)}
                disabled={editNameLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditNameSubmit}
                disabled={editNameLoading}
                className="w-full sm:w-auto min-w-[100px]"
              >
                {editNameLoading ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}, (prev: BoardColumnProps, next: BoardColumnProps) => {
  if (prev.board.id !== next.board.id) return false;
  if (prev.board.name !== next.board.name) return false;

  // Checking cards array reference should be enough for performance
  // The deep check inside BoardColumnContent's memo handles the granular re-renders
  // But for the container, we want to update if dragging might have changed sort order
  return prev.cards === next.cards;
});
