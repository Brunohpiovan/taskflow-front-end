import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

interface EnvironmentEmptyStateProps {
  onCreateClick: () => void;
}

export function EnvironmentEmptyState({ onCreateClick }: EnvironmentEmptyStateProps) {
  return (
    <EmptyState
      icon={<FolderKanban className="h-12 w-12" />}
      title="Você ainda não tem ambientes"
      description="Crie seu primeiro ambiente para começar a organizar suas tarefas."
      action={
        <Button onClick={onCreateClick}>
          Criar meu primeiro ambiente
        </Button>
      }
    />
  );
}
