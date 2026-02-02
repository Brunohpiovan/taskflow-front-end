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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Olá, {user?.name?.split(" ")[0] ?? "usuário"}!
        </h2>
        <p className="text-muted-foreground">
          Aqui está um resumo das suas atividades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambientes</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : environments.length}</div>
            <p className="text-xs text-muted-foreground">Total de ambientes criados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalCards}</div>
            <p className="text-xs text-muted-foreground">Total de cards em todos os quadros</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Ambientes recentes</h3>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-32 rounded bg-muted" />
                  <div className="h-4 w-24 rounded bg-muted" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentEnvironments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Você ainda não tem ambientes. Crie seu primeiro ambiente para começar.
              </p>
              <Button asChild>
                <Link href={ROUTES.ENVIRONMENTS}>Ir para Ambientes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEnvironments.map((env) => (
              <Link key={env.id} href={ROUTES.ENVIRONMENT(env.id)}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{env.name}</CardTitle>
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
          <Button variant="outline" className="mt-4" asChild>
            <Link href={ROUTES.ENVIRONMENTS}>Ver todos os ambientes</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
