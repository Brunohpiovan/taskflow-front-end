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

interface CardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description?: string) => Promise<void>;
  title?: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function CardForm({
  open,
  onOpenChange,
  onSubmit,
  title = "Novo card",
  defaultTitle = "",
  defaultDescription = "",
}: CardFormProps) {
  const [cardTitle, setCardTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
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
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed, desc);
      setCardTitle("");
      setDescription("");
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
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/{CARD_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
