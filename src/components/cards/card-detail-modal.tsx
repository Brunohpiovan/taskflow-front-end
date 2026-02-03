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
        className="max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Detalhes do card</DialogTitle>
          <DialogDescription>Edite o título, a descrição e o quadro do card.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Título</Label>
            <Input
              id="card-title"
              placeholder="Título do card"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-board">Quadro</Label>
            <Select
              onValueChange={(value) => setValue("boardId", value, { shouldDirty: true })}
              defaultValue={card.boardId}
            >
              <SelectTrigger>
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
            <Label htmlFor="card-description">Descrição (opcional)</Label>
            <Textarea
              id="card-description"
              placeholder="Descrição"
              rows={6}
              maxLength={CARD_DESCRIPTION_MAX_LENGTH}
              className="resize-none min-h-[120px]"
              {...register("description")}
            />
            <p className="text-xs text-muted-foreground text-right">
              {descriptionLength}/{CARD_DESCRIPTION_MAX_LENGTH}
            </p>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
