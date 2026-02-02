"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BoardColumn } from "@/components/boards/board-column";
import { BoardForm } from "@/components/boards/board-form";
import { BoardEmptyState } from "@/components/boards/board-empty-state";
import { TaskCardPreview } from "@/components/cards/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnvironmentsStore } from "@/stores/environments.store";
import { useBoardsStore } from "@/stores/boards.store";
import { useCardsStore } from "@/stores/cards.store";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function EnvironmentBoardsPage() {
  const params = useParams();
  const environmentId = params.environmentId as string;

  const [formOpen, setFormOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const environments = useEnvironmentsStore((s) => s.environments);
  const fetchEnvironments = useEnvironmentsStore((s) => s.fetchEnvironments);
  const setCurrentEnvironment = useEnvironmentsStore((s) => s.setCurrentEnvironment);

  const boards = useBoardsStore((s) => s.boards);
  const isLoading = useBoardsStore((s) => s.isLoading);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const clearBoards = useBoardsStore((s) => s.clearBoards);

  const cardsByBoard = useCardsStore((s) => s.cards);
  const fetchCards = useCardsStore((s) => s.fetchCards);
  const moveCard = useCardsStore((s) => s.moveCard);

  const environment = environments.find((e) => e.id === environmentId);

  const boardIds = useMemo(() => boards.map((b) => b.id), [boards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchEnvironments().catch(() => { });
  }, [fetchEnvironments]);

  useEffect(() => {
    if (environmentId) {
      fetchBoards(environmentId).catch(() => { });
      return () => clearBoards();
    }
  }, [environmentId, fetchBoards, clearBoards]);

  useEffect(() => {
    if (environment) setCurrentEnvironment(environment);
  }, [environment, setCurrentEnvironment]);

  useEffect(() => {
    boardIds.forEach((id) => fetchCards(id).catch(() => { }));
  }, [boardIds.join(","), fetchCards]);

  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    for (const list of Object.values(cardsByBoard)) {
      const card = list.find((c) => c.id === activeCardId);
      if (card) return card;
    }
    return null;
  }, [activeCardId, cardsByBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = active.id as string;
    const overId = over.id as string;
    let fromBoardId: string | null = null;
    let targetBoardId: string;
    let newIndex: number;

    for (const [boardId, cards] of Object.entries(cardsByBoard)) {
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx >= 0) {
        fromBoardId = boardId;
        break;
      }
    }
    if (!fromBoardId) return;

    const isOverBoard = boards.some((b) => b.id === overId);
    if (isOverBoard) {
      targetBoardId = overId;
      newIndex = (cardsByBoard[overId]?.length ?? 0);
    } else {
      const targetCard = Object.values(cardsByBoard).flat().find((c) => c.id === overId);
      if (!targetCard) return;
      targetBoardId = targetCard.boardId;
      const targetList = cardsByBoard[targetBoardId] ?? [];
      newIndex = targetList.findIndex((c) => c.id === overId);
      if (newIndex < 0) newIndex = targetList.length;
    }

    if (fromBoardId === targetBoardId) {
      const fromList = cardsByBoard[fromBoardId] ?? [];
      const fromIdx = fromList.findIndex((c) => c.id === cardId);
      if (fromIdx === newIndex) return;
    }

    moveCard(cardId, fromBoardId, targetBoardId, newIndex).then(() => {
      toast.success(fromBoardId === targetBoardId ? "Posição atualizada." : "Card movido.");
    }).catch(() => { });
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } }),
  };

  const handleCreateBoard = async (name: string, description?: string) => {
    await createBoard({
      name,
      description,
      environmentId,
      position: boards.length,
    });
    toast.success("Quadro criado com sucesso.");
    setFormOpen(false);
  };

  if (!environment && environments.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Ambiente não encontrado.</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.ENVIRONMENTS}>Voltar aos ambientes</Link>
        </Button>
      </div>
    );
  }

  if (!environment && !isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={environment?.name ?? "Carregando..."}
        backHref={ROUTES.ENVIRONMENTS}
        backLabel="Ambientes"
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo quadro
          </Button>
        }
      />

      {/* Área dos quadros com margem lateral reduzida */}
      <div className="-mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8">
        <div className="px-1">
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shrink-0 w-[288px] rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 pb-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : boards.length === 0 ? (
            <BoardEmptyState onCreateClick={() => setFormOpen(true)} />
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 min-h-[360px]">
                {boards.map((board) => (
                  <BoardColumn
                    key={board.id}
                    board={board}
                    cards={cardsByBoard[board.id] ?? []}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={dropAnimation} className="z-[9999]">
                {activeCard ? (
                  <div className="w-[300px] cursor-grabbing">
                    <TaskCardPreview card={activeCard} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      <BoardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
}
