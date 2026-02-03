"use client";

import { useEffect } from "react";
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

interface CardDetailModalProps {
  card: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: { title?: string; description?: string; boardId?: string }) => Promise<void>;
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
      reset({
        title: card.title,
        description: (card.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH),
        boardId: card.boardId,
      });
    }
  }, [open, card.id, card.title, card.description, card.boardId, reset]);

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
      });

      reset(data);

      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar o card. Tente novamente.");
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Detalhes do card</DialogTitle>
          <DialogDescription>Edite o título, a descrição e o quadro do card.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-title" className="text-base font-medium">Título</Label>
              <Input
                id="card-title"
                placeholder="Título do card"
                className="h-11"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-board" className="text-base font-medium">Quadro</Label>
              <Select
                onValueChange={(value) => setValue("boardId", value, { shouldDirty: true })}
                defaultValue={card.boardId}
              >
                <SelectTrigger className="h-11">
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
              <Label htmlFor="card-description" className="text-base font-medium">Descrição (opcional)</Label>
              <Textarea
                id="card-description"
                placeholder="Adicione detalhes sobre essa tarefa..."
                rows={6}
                maxLength={CARD_DESCRIPTION_MAX_LENGTH}
                className="resize-none min-h-[120px] leading-relaxed"
                {...register("description")}
              />
              <p className="text-xs text-muted-foreground text-right">
                {descriptionLength}/{CARD_DESCRIPTION_MAX_LENGTH}
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full sm:w-auto min-w-[100px]"
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
