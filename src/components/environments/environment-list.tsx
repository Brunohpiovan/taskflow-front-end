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
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (environments.length === 0) {
    return <EnvironmentEmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
