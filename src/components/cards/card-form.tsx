"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CARD_DESCRIPTION_MAX_LENGTH } from "@/lib/constants";
import { LabelManager } from "./label-manager";

import type { Label as LabelType } from "@/types/card.types";

interface CardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description?: string, dueDate?: string, labels?: string[]) => Promise<void>;
  title?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  boardId: string;
}

export function CardForm({
  open,
  onOpenChange,
  onSubmit,
  title = "Novo card",
  defaultTitle = "",
  defaultDescription = "",
  boardId,
}: CardFormProps) {
  const [cardTitle, setCardTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<LabelType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = cardTitle.trim();
    if (!trimmed) {
      setError("Título é obrigatório.");
      return;
    }
    const desc = description.trim().slice(0, CARD_DESCRIPTION_MAX_LENGTH) || undefined;
    if (description.length > CARD_DESCRIPTION_MAX_LENGTH) {
      setError(`A descrição deve ter no máximo ${CARD_DESCRIPTION_MAX_LENGTH} caracteres.`);
      return;
    }
    const date = dueDate ? new Date(dueDate).toISOString() : undefined;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed, desc, date, selectedLabels.map(l => l.id));
      setCardTitle("");
      setDescription("");
      setDueDate("");
      setSelectedLabels([]);
      onOpenChange(false);
    } catch {
      setError("Não foi possível criar o card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCardTitle(defaultTitle);
      setDescription(defaultDescription);
      setDueDate("");
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Adicione um título e opcionalmente uma descrição para o card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Título</Label>
            <Input
              id="card-title"
              placeholder="Ex: Estudar React"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-description">Descrição (opcional)</Label>
            <Textarea
              id="card-description"
              placeholder="Detalhes da tarefa"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, CARD_DESCRIPTION_MAX_LENGTH))}
              maxLength={CARD_DESCRIPTION_MAX_LENGTH}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/{CARD_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-due-date">Prazo (opcional)</Label>
            <Input
              id="card-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <LabelManager
              boardId={boardId}
              selectedLabels={selectedLabels}
              onChange={(labels) => setSelectedLabels(labels)}
            />
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full sm:w-auto min-w-[100px]"
            >
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
