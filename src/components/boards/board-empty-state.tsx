import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

interface BoardEmptyStateProps {
  onCreateClick: () => void;
}

export function BoardEmptyState({ onCreateClick }: BoardEmptyStateProps) {
  return (
    <EmptyState
      icon={<LayoutGrid className="h-12 w-12" />}
      title="Nenhum quadro ainda"
      description="Crie seu primeiro quadro para começar a adicionar cards e organizar suas tarefas."
      action={
        <Button onClick={onCreateClick}>
          Criar primeiro quadro
        </Button>
      }
    />
  );
}
