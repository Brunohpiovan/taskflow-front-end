"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
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
import { useMemo, useState, memo } from "react";
import { toast } from "sonner";
import { boardSchema } from "@/lib/validations";

interface BoardColumnProps {
  board: Board;
  cards: CardType[];
}

export const BoardColumn = memo(function BoardColumn({ board, cards }: BoardColumnProps) {
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState(board.name);
  const [editNameLoading, setEditNameLoading] = useState(false);

  const { setNodeRef } = useDroppable({ id: board.id });
  const { active, over } = useDndContext();

  const isOverBoard = useMemo(() => {
    if (!over) return false;
    // Highlight if over the board itself
    if (over.id === board.id) return true;
    // Highlight if over any card in this board
    const overCardId = String(over.id);
    return cards.some((c) => c.id === overCardId);
  }, [board.id, over, cards]);

  const createCard = useCardsStore((s) => s.createCard);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
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
        isOverBoard
          ? "bg-muted/60 border-primary/20 ring-2 ring-primary/20 shadow-md"
          : "bg-secondary/50 border-border/80 hover:border-border hover:bg-secondary/70 shadow-sm"
      )}
    >
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
              <DropdownMenuItem onClick={() => setCardFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditNameOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar nome
              </DropdownMenuItem>
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
        <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-0">
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <TaskCard key={card.id} card={card} />
            ))}
          </SortableContext>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start rounded-lg border border-dashed border-border/80 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            onClick={() => setCardFormOpen(true)}
          >
            + Adicionar card
          </Button>
        </CardContent>
      </Card>

      {cardFormOpen && (
        <CardForm
          open={cardFormOpen}
          onOpenChange={setCardFormOpen}
          onSubmit={handleCreateCard}
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
  if (prev.cards.length !== next.cards.length) return false;

  // Shallow comparison for cards array (assuming immutable updates)
  // If card instances change but IDs/content are same, we can rely on TaskCard's own memo.
  // However, dragging changes internal order, so cards list reference will change.
  // We want to re-render if the list of cards changes.
  if (prev.cards !== next.cards) return false;

  return true;
});
