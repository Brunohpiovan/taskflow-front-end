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
    fetchEnvironments().catch(() => {});
  }, [fetchEnvironments]);

  const totalCards = environments.reduce((acc, env) => acc + (env.cardsCount ?? 0), 0);
  const recentEnvironments = environments.slice(0, 3);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Olá, {user?.name?.split(" ")[0] ?? "usuário"}!
        </h2>
        <p className="text-muted-foreground mt-1 text-base">
          Aqui está um resumo das suas atividades.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ambientes</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderKanban className="h-4 w-4 text-icon" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{isLoading ? "..." : environments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de ambientes criados</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <ListTodo className="h-4 w-4 text-icon" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{isLoading ? "..." : totalCards}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de cards em todos os quadros</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-5 text-lg font-semibold text-foreground">Ambientes recentes</h3>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-32 rounded-lg bg-muted" />
                  <div className="h-4 w-24 rounded-lg bg-muted mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentEnvironments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-5 max-w-sm">
                Você ainda não tem ambientes. Crie seu primeiro ambiente para começar.
              </p>
              <Button asChild>
                <Link href={ROUTES.ENVIRONMENTS}>Ir para Ambientes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recentEnvironments.map((env) => (
              <Link key={env.id} href={ROUTES.ENVIRONMENT(env.id)}>
                <Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full border-2 hover:border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">{env.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {env.boardsCount ?? 0} quadros · {env.cardsCount ?? 0} tarefas
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {!isLoading && environments.length > 0 && (
          <Button variant="outline" className="mt-5 rounded-lg" asChild>
            <Link href={ROUTES.ENVIRONMENTS}>Ver todos os ambientes</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
