"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2, Calendar, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardsStore } from "@/stores/cards.store";
import { cn } from "@/lib/utils";
import type { Card as CardType } from "@/types/card.types";
import { useState, memo } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** Apenas a aparência do card, para exibir no DragOverlay (sem sortable/dropdown) */
export function TaskCardPreview({ card }: { card: CardType }) {
  return (
    <Card className="cursor-grabbing w-full rounded-xl border bg-card shadow-2xl ring-2 ring-primary/30">
      <CardContent className="p-3.5 flex flex-row items-start gap-2">
        {card.completed && (
          <div className="flex flex-col gap-1 pt-0.5 overflow-hidden transition-all duration-300 ease-in-out w-5 opacity-100">
            <div className="h-4 w-4 rounded border bg-emerald-600 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-white">
              <Check className="h-3 w-3" />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label, idx) => (
                <div
                  key={idx}
                  className="h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
              ))}
            </div>
          )}

          <p className={cn("font-medium text-sm truncate text-foreground", card.completed && "line-through text-muted-foreground")}>{card.title}</p>

          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{card.description}</p>
          )}

          {card.dueDate && (() => {
            const date = new Date(card.dueDate);
            const isOverdue = new Date() > date && !card.completed;
            return (
              <div className={cn(
                "flex items-center gap-1.5 mt-2 text-xs flex-wrap",
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
                card.completed && "opacity-70"
              )}>
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="whitespace-nowrap">
                  {date.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {isOverdue && <span className="text-[10px] uppercase tracking-wider font-semibold ml-1 whitespace-nowrap">(Atrasado)</span>}
              </div>
            );
          })()}

          {card.members && card.members.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-1.5">
                {card.members.slice(0, 3).map((member, idx) => (
                  <Avatar key={idx} className="h-5 w-5 border-2 border-background">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-[9px] font-medium">?</AvatarFallback>
                  </Avatar>
                ))}
                {card.members.length > 3 && (
                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[9px] font-semibold text-muted-foreground">+{card.members.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleToggleComplete = async () => {
    try {
      await updateCard(card.id, { completed: !card.completed });
      toast.success(card.completed ? "Card reaberto." : "Card concluído!");
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group rounded-xl border bg-cardTask shadow-sm transition-all duration-200 hover:border-border/80 hover:shadow-md",
          card.completed && "opacity-95 bg-muted/30",
          isDragging && "opacity-0 pointer-events-none"
        )}
        {...attributes}
        {...listeners}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isDragging) setMenuOpen(true);
        }}
      >
        <CardContent className="p-3.5 flex flex-row items-start gap-2">
          <div className={cn(
            "flex flex-col gap-1 pt-0.5 overflow-hidden transition-all duration-300 ease-in-out",
            card.completed ? "w-5 opacity-100" : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-100"
          )}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-all mt-0.5 shrink-0",
                      card.completed ? "bg-emerald-600 border-emerald-600 text-white" : "border-muted-foreground/30 hover:border-emerald-500/50"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {card.completed && <Check className="h-3 w-3" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{card.completed ? "Reabrir card" : "Marcar como concluído"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <button
            type="button"
            className="flex-1 text-left min-w-0 rounded-md -m-1 p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setDetailOpen(true)}
          >
            {/* Label indicators - Simplified for list view */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((label, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 w-8 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                ))}
              </div>
            )}
            <p className={cn("font-medium text-sm truncate text-foreground", card.completed && " text-muted-foreground")}>{card.title}</p>
            {card.description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{card.description}</p>
            ) : (
              <p className="text-xs text-muted-foreground/70 mt-1 italic">Sem descrição</p>
            )}
            {card.dueDate && (() => {
              const date = new Date(card.dueDate);
              const isOverdue = new Date() > date && !card.completed;
              return (
                <div className={cn(
                  "flex items-center gap-1.5 mt-2 text-xs flex-wrap",
                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
                  card.completed && "opacity-70"
                )}>
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="whitespace-nowrap">
                    {date.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {isOverdue && <span className="text-[10px] uppercase tracking-wider font-semibold ml-1 whitespace-nowrap">(Atrasado)</span>}
                </div>
              );
            })()}
            {/* Card Members - Simplified for list view */}
            {card.members && card.members.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-1.5">
                  {card.members.slice(0, 3).map((member, idx) => (
                    <Avatar key={idx} className="h-5 w-5 border-2 border-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[9px] font-medium">?</AvatarFallback>
                    </Avatar>
                  ))}
                  {card.members.length > 3 && (
                    <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-muted-foreground">+{card.members.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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

            try {
              if (boardId && boardId !== card.boardId) {
                await moveCard(card.id, card.boardId, boardId, 0);
              }

              // Only update if there's actual data to update
              if (Object.keys(updateData).length > 0) {
                await updateCard(card.id, updateData);
              }

              // Only show toast if it's not just a label update
              if (!data.labels || Object.keys(data).length > 1) {
                toast.success("Card atualizado.");
              }
            } catch (error) {
              console.error('Update failed:', error);
              toast.error("Erro ao atualizar card.");
            }
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
    prev.card.boardId === next.card.boardId &&
    prev.card.dueDate === next.card.dueDate &&
    prev.card.completed === next.card.completed &&
    JSON.stringify(prev.card.labels) === JSON.stringify(next.card.labels) &&
    JSON.stringify(prev.card.members) === JSON.stringify(next.card.members)
  );
});
