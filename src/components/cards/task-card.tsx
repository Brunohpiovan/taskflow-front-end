"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardsStore } from "@/stores/cards.store";
import { cn } from "@/lib/utils";
import type { Card as CardType } from "@/types/card.types";
import { useState, memo } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

/** Apenas a aparência do card, para exibir no DragOverlay (sem sortable/dropdown) */
export function TaskCardPreview({ card }: { card: CardType }) {
  return (
    <Card className="cursor-grabbing w-full rounded-xl border bg-card shadow-2xl ring-2 ring-primary/30">
      <CardContent className="p-3.5">
        <p className="font-medium text-sm truncate text-foreground">{card.title}</p>
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{card.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  card: CardType;
}

export const TaskCard = memo(function TaskCard({ card }: TaskCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const updateCard = useCardsStore((s) => s.updateCard);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const moveCard = useCardsStore((s) => s.moveCard);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    await deleteCard(card.id);
    toast.success("Card excluído.");
    setDetailOpen(false);
    setConfirmDeleteOpen(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group cursor-grab active:cursor-grabbing rounded-xl border bg-cardTask shadow-sm transition-all duration-200 hover:border-border/80 hover:shadow-md",
          isDragging && "opacity-0 pointer-events-none"
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3.5 flex flex-row items-start justify-between gap-2">
          <button
            type="button"
            className="flex-1 text-left min-w-0 rounded-md -m-1 p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setDetailOpen(true)}
          >
            <p className="font-medium text-sm truncate text-foreground">{card.title}</p>
            {card.description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{card.description}</p>
            ) : (
              <p className="text-xs text-muted-foreground/70 mt-1 italic">Sem descrição</p>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg opacity-60 hover:opacity-100 hover:bg-muted"
                aria-label="Menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setConfirmDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {detailOpen && (
        <CardDetailModal
          card={card}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={async (data) => {
            const { boardId, ...updateData } = data;
            if (boardId && boardId !== card.boardId) {
              await moveCard(card.id, card.boardId, boardId, 0);
            }
            await updateCard(card.id, updateData);
            toast.success("Card atualizado.");
          }}
          onDelete={() => {
            setConfirmDeleteOpen(true);
          }}
        />
      )}

      {confirmDeleteOpen && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Excluir card"
          description="Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}, (prev: TaskCardProps, next: TaskCardProps) => {
  return (
    prev.card.id === next.card.id &&
    prev.card.title === next.card.title &&
    prev.card.description === next.card.description &&
    prev.card.position === next.card.position &&
    prev.card.boardId === next.card.boardId
  );
});
