"use client";

import { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CARD_DESCRIPTION_MAX_LENGTH } from "@/lib/constants";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoardsStore } from "@/stores/boards.store";
import { cardSchema, type CardFormData } from "@/lib/validations";
import type { Card as CardType } from "@/types/card.types";
import { LabelManager } from "./label-manager";
import { CommentsSection } from "./comments-section";
import { ActivityLogList } from "./activity-log-list";

interface CardDetailModalProps {
  card: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: { title?: string; description?: string; boardId?: string; dueDate?: string; labels?: string[] }) => Promise<void>;
  onDelete: () => void;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const initialDescription = (card.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH);
  const updateInProgressRef = useRef(false);
  const lastLabelIdsRef = useRef<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: card.title,
      description: initialDescription,
      boardId: card.boardId,
    },
  });
  const descriptionValue = watch("description", initialDescription);
  const descriptionLength = (descriptionValue ?? "").length;

  const boards = useBoardsStore((s) => s.boards);

  useEffect(() => {
    if (open) {
      let formattedDate = "";
      if (card.dueDate) {
        // Converte para o formato YYYY-MM-DDThh:mm esperado pelo input datetime-local
        const date = new Date(card.dueDate);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        formattedDate = localDate.toISOString().slice(0, 16);
      }

      reset({
        title: card.title,
        description: (card.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH),
        boardId: card.boardId,
        dueDate: formattedDate,
      });

      // Reset label tracking when modal opens
      const currentLabelIds = (card.labels || []).map(l => l.id).sort().join(',');
      lastLabelIdsRef.current = currentLabelIds;
    }
  }, [open, card.id, card.title, card.description, card.boardId, card.dueDate, reset]);

  const onSubmit = async (data: CardFormData) => {
    if (!isDirty) {
      toast.info("Nenhuma alteração realizada.");
      onOpenChange(false);
      return;
    }

    try {
      await onUpdate({
        title: data.title,
        description: data.description,
        boardId: data.boardId,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });

      reset(data);

      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar o card. Tente novamente.");
    }
  };

  const handleLabelChange = useCallback(async (labels: typeof card.labels) => {
    // Prevent concurrent updates
    if (updateInProgressRef.current) {
      return;
    }

    // Safety check
    if (!labels) {
      return;
    }

    try {
      const newLabelIds = labels.map(l => l.id).sort().join(',');

      // Only update if labels actually changed
      if (newLabelIds === lastLabelIdsRef.current) {
        return;
      }

      updateInProgressRef.current = true;
      lastLabelIdsRef.current = newLabelIds;

      await onUpdate({ labels: labels.map(l => l.id) });
    } catch (error) {
      console.error('Failed to update labels:', error);
      toast.error("Erro ao atualizar etiquetas.");
    } finally {
      updateInProgressRef.current = false;
    }
  }, [onUpdate]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-full max-h-[90vh] p-0 gap-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Detalhes do Card</DialogTitle>
          <DialogDescription>
            Edite as informações do card, adicione comentários e veja o histórico de atividades.
          </DialogDescription>
        </DialogHeader>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden" style={{ height: 'calc(90vh - 140px)' }}>

          {/* Left Column - Form Inputs */}
          <div className="lg:col-span-1 border-r px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-title" className="text-sm font-medium">Título</Label>
                <Input
                  id="card-title"
                  placeholder="Título do card"
                  className="h-10"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-board" className="text-sm font-medium">Quadro</Label>
                <Select
                  onValueChange={(value) => setValue("boardId", value, { shouldDirty: true })}
                  defaultValue={card.boardId}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione um quadro" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-description" className="text-sm font-medium">Descrição</Label>
                <Textarea
                  id="card-description"
                  placeholder="Adicione detalhes sobre essa tarefa..."
                  rows={4}
                  maxLength={CARD_DESCRIPTION_MAX_LENGTH}
                  className="resize-none min-h-[100px] leading-relaxed text-sm"
                  {...register("description")}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {descriptionLength}/{CARD_DESCRIPTION_MAX_LENGTH}
                </p>
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-due-date" className="text-sm font-medium">Prazo</Label>
                <Input
                  id="card-due-date"
                  type="datetime-local"
                  className="h-10"
                  {...register("dueDate")}
                />
              </div>

              <div className="space-y-2">
                <LabelManager
                  boardId={card.boardId}
                  selectedLabels={card.labels || []}
                  onChange={handleLabelChange}
                />
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>

          {/* Middle Column - Comments */}
          <div className="lg:col-span-1 border-r overflow-y-auto px-6 py-4 bg-muted/20">
            <div className="sticky top-0 bg-muted/20 pb-3 mb-4 border-b z-10">
              <h3 className="font-semibold text-base">Comentários</h3>
              <p className="text-xs text-muted-foreground">Discussões sobre este card</p>
            </div>
            <CommentsSection cardId={card.id} />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-1 overflow-y-auto px-6 py-4 bg-muted/10">
            <div className="sticky top-0 bg-muted/10 pb-3 mb-4 border-b z-10">
              <h3 className="font-semibold text-base">Histórico de Atividades</h3>
              <p className="text-xs text-muted-foreground">Registro de mudanças</p>
            </div>
            <ActivityLogList cardId={card.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
