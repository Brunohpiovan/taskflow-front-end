"use client";

import { useState, useCallback, useRef } from "react";
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
import { CardMembersSelector } from "./card-members-selector";
import type { Label as LabelType, CardMember } from "@/types/card.types";
import type { EnvironmentMember } from "@/types/environment.types";

interface CardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description?: string, dueDate?: string, labels?: string[], members?: string[]) => Promise<void>;
  title?: string;
  defaultTitle?: string;
  defaultDescription?: string;

  boardId: string;
  environmentId: string;
  environmentMembers: EnvironmentMember[];
}

export function CardForm({
  open,
  onOpenChange,
  onSubmit,
  title = "Novo card",
  defaultTitle = "",
  defaultDescription = "",
  // boardId,
  environmentId,
  environmentMembers,
}: CardFormProps) {
  const [cardTitle, setCardTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<LabelType[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<CardMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLabelIdsRef = useRef<string>("");
  const isUpdatingLabelsRef = useRef(false);

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
      await onSubmit(trimmed, desc, date, selectedLabels.map(l => l.id), selectedMembers.map(m => m.userId));
      setCardTitle("");
      setDescription("");
      setDueDate("");
      setSelectedLabels([]);
      setSelectedMembers([]);
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
      setSelectedLabels([]);
      setSelectedMembers([]);
      setError(null);
      lastLabelIdsRef.current = "";
    }
    onOpenChange(next);
  };

  const handleLabelChange = useCallback((labels: LabelType[]) => {
    // Prevent concurrent updates
    if (isUpdatingLabelsRef.current) {
      return;
    }

    const newLabelIds = labels.map(l => l.id).sort().join(',');

    // Only update if labels actually changed
    if (newLabelIds === lastLabelIdsRef.current) {
      return;
    }

    isUpdatingLabelsRef.current = true;
    lastLabelIdsRef.current = newLabelIds;

    setSelectedLabels(labels);

    // Reset flag after a short delay to allow React to process
    setTimeout(() => {
      isUpdatingLabelsRef.current = false;
    }, 100);
  }, []);

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
              environmentId={environmentId}
              selectedLabels={selectedLabels}
              onChange={handleLabelChange}
            />
          </div>
          <div className="space-y-2">
            <CardMembersSelector
              cardId=""
              currentMembers={selectedMembers}
              environmentMembers={environmentMembers}
              onAddMember={async (userId) => {
                const member = environmentMembers.find(m => m.userId === userId);
                if (member) {
                  setSelectedMembers(prev => [...prev, {
                    id: '',
                    userId: member.userId,
                    name: member.name,
                    email: member.email,
                    avatar: member.avatar,
                    assignedAt: new Date().toISOString(),
                  }]);
                }
              }}
              onRemoveMember={async (userId) => {
                setSelectedMembers(prev => prev.filter(m => m.userId !== userId));
              }}
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
