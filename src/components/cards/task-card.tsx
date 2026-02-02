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
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

/** Apenas a aparência do card, para exibir no DragOverlay (sem sortable/dropdown) */
export function TaskCardPreview({ card }: { card: CardType }) {
  return (
    <Card className="cursor-grabbing shadow-xl ring-2 ring-primary/30 w-full">
      <CardContent className="p-3">
        <p className="font-medium text-sm truncate">{card.title}</p>
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{card.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskCardProps {
  card: CardType;
}

export function TaskCard({ card }: TaskCardProps) {
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
          "cursor-grab active:cursor-grabbing transition-shadow",
          isDragging && "opacity-0 pointer-events-none"
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3 flex flex-row items-start justify-between gap-2">
          <button
            type="button"
            className="flex-1 text-left min-w-0"
            onClick={() => setDetailOpen(true)}
          >
            <p className="font-medium text-sm truncate">{card.title}</p>
            {card.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{card.description}</p>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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

      <CardDetailModal
        card={card}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={async (data) => {
          await updateCard(card.id, data);
          toast.success("Card atualizado.");
        }}
        onDelete={() => {
          setDetailOpen(false);
          setConfirmDeleteOpen(true);
        }}
      />

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
    </>
  );
}
