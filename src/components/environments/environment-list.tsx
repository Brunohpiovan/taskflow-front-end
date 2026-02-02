"use client";

import { EnvironmentCard } from "./environment-card";
import { EnvironmentEmptyState } from "./environment-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Environment } from "@/types/environment.types";

interface EnvironmentListProps {
  environments: Environment[];
  isLoading: boolean;
  onEdit: (environment: Environment) => void;
  onDelete: (environment: Environment) => void;
  onCreateClick: () => void;
}

export function EnvironmentList({
  environments,
  isLoading,
  onEdit,
  onDelete,
  onCreateClick,
}: EnvironmentListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (environments.length === 0) {
    return <EnvironmentEmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {environments.map((env) => (
        <EnvironmentCard
          key={env.id}
          environment={env}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
