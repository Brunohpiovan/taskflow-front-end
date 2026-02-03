"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FolderKanban, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useEnvironmentsStore } from "@/stores/environments.store";
import { ROUTES } from "@/lib/constants";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const environments = useEnvironmentsStore((s) => s.environments);
  const fetchEnvironments = useEnvironmentsStore((s) => s.fetchEnvironments);
  const isLoading = useEnvironmentsStore((s) => s.isLoading);

  useEffect(() => {
    fetchEnvironments().catch(() => { });
  }, [fetchEnvironments]);

  const totalCards = environments.reduce((acc, env) => acc + (env.cardsCount ?? 0), 0);
  const recentEnvironments = environments.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Olá, {user?.name?.split(" ")[0] ?? "usuário"}
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Bem-vindo de volta ao TaskFlow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ambientes</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{isLoading ? "..." : environments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ambientes ativos</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{isLoading ? "..." : totalCards}</div>
            <p className="text-xs text-muted-foreground mt-1">Total acumulado</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-foreground">Recentes</h3>
          {!isLoading && environments.length > 0 && (
            <Button variant="link" className="text-muted-foreground hover:text-foreground h-auto p-0" asChild>
              <Link href={ROUTES.ENVIRONMENTS}>Ver todos</Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse shadow-sm border-muted">
                <CardHeader>
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentEnvironments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">Sem ambientes</h3>
            <p className="mt-1 text-sm text-muted-foreground">Comece criando um novo ambiente de trabalho.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={ROUTES.ENVIRONMENTS}>Criar ambiente</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEnvironments.map((env) => (
              <Link key={env.id} href={ROUTES.ENVIRONMENT(env.id)} className="block group">
                <Card className="h-full transition-colors hover:bg-muted/40 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium truncate  decoration-1 underline-offset-4">
                      {env.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{env.boardsCount ?? 0} quadros</span>
                      <span>•</span>
                      <span>{env.cardsCount ?? 0} tarefas</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
