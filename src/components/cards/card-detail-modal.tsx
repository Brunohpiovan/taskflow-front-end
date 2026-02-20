"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CARD_DESCRIPTION_MAX_LENGTH } from "@/lib/constants";
// import { Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  //   DialogFooter,
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
import type { Card as CardType, Label as LabelType } from "@/types/card.types";
import type { EnvironmentMember } from "@/types/environment.types";
import { LabelManager } from "./label-manager";
import { CommentsSection } from "./comments-section";
import { ActivityLogList } from "./activity-log-list";
import { CardMembersSelector } from "./card-members-selector";
import { cardsService } from "@/services/cards.service";
import { environmentsService } from "@/services/environments.service";
import { useAuthStore } from "@/stores/auth.store";
import type { CardMember } from "@/types/card.types";


interface CardDetailModalProps {
  card: CardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: { title?: string; description?: string; boardId?: string; dueDate?: string; labels?: string[]; completed?: boolean }) => Promise<void>;
  onDelete: () => void;
  environmentId?: string;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onUpdate,
  // onDelete,
  environmentId,
}: CardDetailModalProps) {
  const initialDescription = (card.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH);
  const updateInProgressRef = useRef(false);
  const lastLabelIdsRef = useRef<string>("");
  const initialMembersRef = useRef<CardMember[]>([]);
  const [localLabels, setLocalLabels] = useState<LabelType[]>([]);
  const [fullCard, setFullCard] = useState<CardType | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const hasInitializedRef = useRef(false);
  const isFetchingCardRef = useRef(false);
  const isFetchingBoardsRef = useRef(false);
  const [environmentMembers, setEnvironmentMembers] = useState<EnvironmentMember[]>([]);
  const [cardMembers, setCardMembers] = useState<CardMember[]>([]);
  const { user } = useAuthStore();

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
      completed: card.completed,
    },
  });
  const descriptionValue = watch("description", initialDescription);
  const descriptionLength = (descriptionValue ?? "").length;

  const { boards, fetchBoards } = useBoardsStore();

  // Determine if the current user is an OWNER of the environment
  const isOwner = useMemo(() => {
    if (environmentMembers.length === 0) return false;
    if (!user) return false;

    const currentMember = environmentMembers.find(m =>
      String(m.userId) === String(user.id) ||
      (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
    );

    if (!currentMember) return false;

    // User is owner if explicitly OWNER role OR if they are the only member in the list
    return currentMember.role === 'OWNER' || environmentMembers.length === 1;
  }, [environmentMembers, user]);

  // Fetch complete card data when modal opens
  useEffect(() => {
    if (open && card.id) {
      if (isFetchingCardRef.current) return;
      isFetchingCardRef.current = true;

      setLoadingCard(true);
      hasInitializedRef.current = false;
      cardsService.getById(card.id)
        .then((fetchedCard) => {
          const labels = (fetchedCard.labels || []) as LabelType[];
          const members = (fetchedCard.members || []) as CardMember[];
          setFullCard(fetchedCard);
          setLocalLabels(labels);
          setCardMembers(members);
          initialMembersRef.current = members;
          lastLabelIdsRef.current = labels.map(l => l.id).sort().join(',');
        })
        .catch((error) => {
          console.error('Failed to fetch card details:', error);
          toast.error("Erro ao carregar detalhes do card");
          setFullCard(card);
          if (card.labels && card.labels.length > 0 && 'id' in card.labels[0]) {
            setLocalLabels(card.labels as LabelType[]);
          } else {
            setLocalLabels([]);
          }
          setCardMembers([]);
          initialMembersRef.current = [];
        })
        .finally(() => {
          setLoadingCard(false);
          isFetchingCardRef.current = false;
        });
    } else if (!open) {
      hasInitializedRef.current = false;
      setEnvironmentMembers([]);
      setCardMembers([]);
      initialMembersRef.current = [];
      isFetchingCardRef.current = false;
    }
  }, [open, card.id, card]); // card.id is the stable key; card is included to satisfy exhaustive-deps

  // Lazy load boards and fetch environment members
  useEffect(() => {
    if (!open) return;

    if (environmentId) {
      const hasBoardsForEnv = boards.some(b => b.environmentId === environmentId);
      if (!hasBoardsForEnv && !isFetchingBoardsRef.current) {
        isFetchingBoardsRef.current = true;
        fetchBoards(environmentId)
          .catch(console.error)
          .finally(() => {
            isFetchingBoardsRef.current = false;
          });
      }
    }

    const currentBoard = boards.find(b => b.id === card.boardId);

    // This handles the case where calendar view doesn't load boards initially
    if (!currentBoard) {
      // We need the environmentId to fetch boards. 
      // If we don't have it on the card (it's not on the minimal calendar card), 
      // we might need to fetch the card details first which we are already doing above.
      // However, `fullCard` might not be set yet.

      // Strategy: 
      // 1. If we have fullCard with board info, use that.
      // 2. If we can't find the board in the store, we might need to fetch all boards for the environment.
      // But we need environmentId. 

      // The calendar view passes `card` which has `boardId`.
      // The backend `getById` returns `boardId`.
      // We need to fetch boards using `environmentsService` or `boardsService`.

      // Actually, the best place is likely where we load the full card details.
      // Once we have the full card, we know the environmentId (via labels or similar? No wait).
      // The `Card` type has `boardId`. The `Board` has `environmentId`.
      // We can't know `environmentId` just from `d`.

      // Wait, `CardDetailModal` doesn't receive `environmentId`.
      // But `CalendarView` knows `selectedEnvId`. 
      // Maybe we should pass `environmentId` to `CardDetailModal`? 
      // That would be cleanest. But let's look at what we have.

      // `fullCard` logic above fetches card details. 
      // Valid constraint: We need `environmentId` to fetch boards if they aren't loaded.
      // `cardsService.getById` returns `Card`.

      // Let's rely on the fact that `CalendarView` has `selectedEnvId`.
      // AND `CardDetailModal` is used in `BoardView` too.

      // PROPOSAL: Modify `CardDetailModal` props to accept `environmentId`.
      // This is a robust fix.
    }

    if (currentBoard?.environmentId) {
      environmentsService.getMembers(currentBoard.environmentId)
        .then((members) => {
          setEnvironmentMembers(members);
        })
        .catch((error) => {
          console.error('Failed to fetch environment members:', error);
        });
    }
  }, [open, environmentId, boards, card.boardId, fetchBoards]);

  useEffect(() => {
    if (open && fullCard) {
      let formattedDate = "";
      if (fullCard.dueDate) {
        // Converte para o formato YYYY-MM-DDThh:mm esperado pelo input datetime-local
        const date = new Date(fullCard.dueDate);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        formattedDate = localDate.toISOString().slice(0, 16);
      }

      // Only reset form if non-label fields have changed
      // This prevents flickering when labels are updated
      const currentLabels = (fullCard.labels || []) as LabelType[];
      const currentLabelIds = currentLabels.map(l => l.id).sort().join(',');
      const labelsChanged = currentLabelIds !== lastLabelIdsRef.current;

      // Check if other fields changed
      const otherFieldsChanged =
        fullCard.title !== watch('title') ||
        (fullCard.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH) !== watch('description') ||
        fullCard.boardId !== watch('boardId') ||
        formattedDate !== watch('dueDate') ||
        fullCard.completed !== watch('completed');

      if (otherFieldsChanged || !lastLabelIdsRef.current) {
        reset({
          title: fullCard.title,
          description: (fullCard.description ?? "").slice(0, CARD_DESCRIPTION_MAX_LENGTH),
          boardId: fullCard.boardId,
          dueDate: formattedDate,
          completed: fullCard.completed,
        });
      }

      if (labelsChanged) {
        lastLabelIdsRef.current = currentLabelIds;
      }
    }
  }, [open, fullCard, reset, watch]);

  const onSubmit = async (data: CardFormData) => {
    const labelsChanged = lastLabelIdsRef.current !== localLabels.map(l => l.id).sort().join(',');

    // Check for member changes
    const currentMemberIds = cardMembers.map(m => m.userId).sort().join(',');
    const initialMemberIds = initialMembersRef.current.map(m => m.userId).sort().join(',');
    const membersChanged = currentMemberIds !== initialMemberIds;

    if (!isDirty && !labelsChanged && !membersChanged) {
      toast.info("Nenhuma alteração realizada.");
      onOpenChange(false);
      return;
    }

    try {
      // Handle member updates
      const initialUserIds = initialMembersRef.current.map(m => m.userId);
      const currentUserIds = cardMembers.map(m => m.userId);

      const membersToAdd = currentUserIds.filter(id => !initialUserIds.includes(id));
      const membersToRemove = initialUserIds.filter(id => !currentUserIds.includes(id));

      const memberPromises: Promise<void>[] = [];

      membersToAdd.forEach(userId => {
        memberPromises.push(cardsService.addCardMember(card.id, userId));
      });

      membersToRemove.forEach(userId => {
        memberPromises.push(cardsService.removeCardMember(card.id, userId));
      });

      // Execute member updates first to ensure DB is consistent before board refresh
      await Promise.all(memberPromises);

      // Update card details (which might trigger board refresh)
      await onUpdate({
        title: data.title,
        description: data.description,
        boardId: data.boardId,
        completed: data.completed,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        labels: localLabels.map(l => l.id),
      });

      // Refresh card data if modal stays open (though we close it here)
      reset(data);
      lastLabelIdsRef.current = localLabels.map(l => l.id).sort().join(',');
      initialMembersRef.current = cardMembers;

      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar o card. Tente novamente.");
    }
  };

  const handleLabelChange = useCallback((labels: LabelType[]) => {
    // Prevent concurrent updates
    if (updateInProgressRef.current) {
      return;
    }

    const newLabelIds = labels.map(l => l.id).sort().join(',');
    const currentLabelIds = localLabels.map(l => l.id).sort().join(',');

    // Only update if labels actually changed
    if (newLabelIds === currentLabelIds) {
      return;
    }

    updateInProgressRef.current = true;

    // Update local state immediately for UI feedback
    setLocalLabels(labels);

    // Reset flag after a short delay
    setTimeout(() => {
      updateInProgressRef.current = false;
    }, 100);
  }, [localLabels]);

  const handleAddMember = (userId: string) => {
    const memberEnv = environmentMembers.find(m => m.userId === userId);
    if (!memberEnv) return;

    const newMember: CardMember = {
      id: `temp-${Date.now()}-${userId}`, // Temp ID strictly for local keying
      userId: memberEnv.userId,
      name: memberEnv.name,
      email: memberEnv.email || "",
      avatar: memberEnv.avatar,
      assignedAt: new Date().toISOString()
    };

    setCardMembers(prev => [...prev, newMember]);
  };

  const handleRemoveMember = (userId: string) => {
    setCardMembers(prev => prev.filter(m => m.userId !== userId));
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[95vw] w-full max-h-[98vh] p-0 gap-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Detalhes do Card</DialogTitle>
          <DialogDescription>
            Edite as informações do card, adicione comentários e veja o histórico de atividades.
          </DialogDescription>
        </DialogHeader>

        {/* Three Column Layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden" style={{ height: 'calc(98vh - 140px)' }}>

          {/* Left Column - Form Inputs */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r overflow-y-auto px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="card-title" className="text-sm font-medium">Título</Label>
                <Input
                  id="card-title"
                  placeholder="Título do card"
                  className="h-9"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox
                  id="card-completed"
                  checked={watch("completed")}
                  onCheckedChange={(checked) => setValue("completed", !!checked, { shouldDirty: true })}
                />
                <Label htmlFor="card-completed" className="text-sm font-medium cursor-pointer">
                  Marcar como concluído
                </Label>
              </div>

              <div className="space-y-1">
                <Label htmlFor="card-board" className="text-sm font-medium">Quadro</Label>
                <Select
                  onValueChange={(value) => setValue("boardId", value, { shouldDirty: true })}
                  defaultValue={card.boardId}
                >
                  <SelectTrigger className="h-9">
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

              <div className="space-y-1">
                <Label htmlFor="card-description" className="text-sm font-medium">Descrição</Label>
                <Textarea
                  id="card-description"
                  placeholder="Adicione detalhes sobre essa tarefa..."
                  rows={2}
                  maxLength={CARD_DESCRIPTION_MAX_LENGTH}
                  className="resize-none min-h-[60px] leading-relaxed text-sm"
                  {...register("description")}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {descriptionLength}/{CARD_DESCRIPTION_MAX_LENGTH}
                </p>
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="card-due-date" className="text-sm font-medium">Prazo</Label>
                <Input
                  id="card-due-date"
                  type="datetime-local"
                  className="h-9"
                  {...register("dueDate")}
                />
              </div>

              <div className="space-y-1">
                {loadingCard ? (
                  <p className="text-sm text-muted-foreground">Carregando labels...</p>
                ) : (() => {
                  // Get environmentId from the board
                  const currentBoard = boards.find(b => b.id === (fullCard?.boardId || card.boardId));
                  const environmentId = currentBoard?.environmentId || '';

                  return environmentId ? (
                    <LabelManager
                      environmentId={environmentId}
                      selectedLabels={localLabels}
                      onChange={handleLabelChange}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  );
                })()}
              </div>

              {/* Card Members */}
              <div className="space-y-1">
                {loadingCard ? (
                  <p className="text-sm text-muted-foreground">Carregando membros...</p>
                ) : (
                  <CardMembersSelector
                    currentMembers={cardMembers}
                    environmentMembers={environmentMembers}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t mt-3">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full h-9"
                >
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full h-9"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>

          {/* Middle Column - Comments */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r overflow-y-auto px-6 pb-6 bg-slate-50 dark:bg-slate-900">
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 pt-4 pb-3 mb-4 border-b z-10 -mx-6 px-6">
              <h3 className="font-semibold text-base">Comentários</h3>
              <p className="text-xs text-muted-foreground">Discussões sobre este card</p>
            </div>
            <CommentsSection cardId={card.id} isOwner={isOwner} />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-1 overflow-y-auto px-6 pb-6 bg-slate-100 dark:bg-slate-950">
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-950 pt-4 pb-3 mb-4 border-b z-10 -mx-6 px-6">
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
