"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, LayoutGrid, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import type { Environment } from "@/types/environment.types";

interface EnvironmentCardProps {
  environment: Environment;
  onEdit: (environment: Environment) => void;
  onDelete: (environment: Environment) => void;
}

export function EnvironmentCard({ environment, onEdit, onDelete }: EnvironmentCardProps) {
  const boardsCount = environment.boardsCount ?? 0;
  const cardsCount = environment.cardsCount ?? 0;
  const accentColor = "hsl(var(--primary))";

  return (
    <Card
      className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: accentColor,
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3 pt-5 px-5">
        <Link
          href={ROUTES.ENVIRONMENT(environment.slug)}
          className="flex-1 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}
            >
              <LayoutGrid className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate text-foreground group-hover:text-icon transition-colors">
                {environment.name}
              </h3>
              {environment.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                  {environment.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">Sem descrição</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg opacity-70 hover:opacity-100 hover:bg-muted/80 transition-opacity"
              aria-label="Abrir menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(environment)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(environment)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <Link
          href={ROUTES.ENVIRONMENT(environment.slug)}
          className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <span className="font-medium tabular-nums text-foreground/90">{boardsCount}</span>
          <span>quadros</span>
          <span className="text-border">·</span>
          <span className="font-medium tabular-nums text-foreground/90">{cardsCount}</span>
          <span>tarefas</span>
        </Link>
      </CardContent>
    </Card>
  );
}
