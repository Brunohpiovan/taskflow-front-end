import Link from "next/link";
import { FolderKanban, ListTodo, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { serverEnvironmentsService } from "@/services/server-environments.service";
import { serverAuthService } from "@/services/server-auth.service";
import { DashboardHeader } from "./components/dashboard-header";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const environments = await serverEnvironmentsService.getAllDashboard().catch(() => []);
  const user = await serverAuthService.getProfile().catch(() => null);

  const totalCards = environments.reduce((acc, env) => acc + (env.cardsCount ?? 0), 0);
  const totalBoards = environments.reduce((acc, env) => acc + (env.boardsCount ?? 0), 0);
  const recentEnvironments = environments.slice(0, 6);

  // Simular algumas métricas adicionais (em produção viriam do backend)
  const completedCards = Math.floor(totalCards * 0.6); // 60% concluídas
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const metrics = [
    {
      title: "Ambientes",
      value: environments.length,
      description: "Total de ambientes",
      icon: FolderKanban,
      trend: "+2 este mês",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Quadros",
      value: totalBoards,
      description: "Quadros ativos",
      icon: ListTodo,
      trend: `${environments.length} ambientes`,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Tarefas",
      value: totalCards,
      description: "Total de cards",
      icon: CheckCircle2,
      trend: `${completedCards} concluídas`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      description: "Cards concluídos",
      icon: TrendingUp,
      trend: completionRate >= 50 ? "Ótimo progresso!" : "Continue assim!",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader initialUser={user} />

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="relative overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                <metric.icon className={cn("h-4 w-4", metric.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {metric.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Environments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ambientes Recentes</h3>
            <p className="text-sm text-muted-foreground">Acesse rapidamente seus ambientes</p>
          </div>
          {environments.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.ENVIRONMENTS}>
                Ver todos
                <span className="ml-1">→</span>
              </Link>
            </Button>
          )}
        </div>

        {recentEnvironments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhum ambiente ainda</h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                Comece criando seu primeiro ambiente de trabalho para organizar suas tarefas.
              </p>
              <Button asChild>
                <Link href={ROUTES.ENVIRONMENTS}>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Criar Primeiro Ambiente
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEnvironments.map((env) => (
              <Link
                key={env.id}
                href={ROUTES.ENVIRONMENT(env.slug)}
                className="block group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-hover:scale-[1.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                          {env.name}
                        </CardTitle>
                      </div>
                      <FolderKanban className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ListTodo className="h-3.5 w-3.5" />
                        <span className="font-medium">{env.boardsCount ?? 0}</span>
                        <span className="text-xs">quadros</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-medium">{env.cardsCount ?? 0}</span>
                        <span className="text-xs">tarefas</span>
                      </div>
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
