"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, LayoutGrid } from "lucide-react";
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

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link href={ROUTES.ENVIRONMENT(environment.id)} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              style={environment.color ? { backgroundColor: `${environment.color}20`, color: environment.color } : undefined}
            >
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{environment.name}</h3>
              {environment.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{environment.description}</p>
              )}
            </div>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      <CardContent>
        <Link href={ROUTES.ENVIRONMENT(environment.id)} className="block">
          <p className="text-sm text-muted-foreground">
            {boardsCount} quadros · {cardsCount} tarefas
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
