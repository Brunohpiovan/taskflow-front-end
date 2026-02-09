"use client";

import { MetricCard } from "./metric-card";
import {
    LayoutDashboard,
    Columns3,
    FileText,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Clock,
    MessageSquare,
} from "lucide-react";
import type { MetricsResponse } from "@/types/metrics.types";

interface MetricsGridProps {
    metrics: MetricsResponse;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Ambientes"
                value={metrics.totalEnvironments}
                icon={LayoutDashboard}
                description="Total de ambientes"
            />
            <MetricCard
                title="Quadros"
                value={metrics.totalBoards}
                icon={Columns3}
                description="Total de quadros"
            />
            <MetricCard
                title="Cards"
                value={metrics.totalCards}
                icon={FileText}
                description="Total de cards"
            />
            <MetricCard
                title="Taxa de Conclusão"
                value={`${metrics.completionRate}%`}
                icon={CheckCircle2}
                description="Cards concluídos"
                className={
                    metrics.completionRate >= 70
                        ? "border-green-200 dark:border-green-800"
                        : ""
                }
            />
            <MetricCard
                title="Criados (7 dias)"
                value={metrics.cardsCreatedLast7Days}
                icon={TrendingUp}
                description="Cards criados recentemente"
            />
            <MetricCard
                title="Concluídos (7 dias)"
                value={metrics.cardsCompletedLast7Days}
                icon={CheckCircle2}
                description="Cards finalizados"
            />
            <MetricCard
                title="Atrasados"
                value={metrics.overdueTasks}
                icon={AlertCircle}
                description="Cards com prazo vencido"
                className={
                    metrics.overdueTasks > 0
                        ? "border-red-200 dark:border-red-800"
                        : ""
                }
            />
            <MetricCard
                title="Vencendo em Breve"
                value={metrics.tasksDueSoon}
                icon={Clock}
                description="Próximos 3 dias"
                className={
                    metrics.tasksDueSoon > 0
                        ? "border-yellow-200 dark:border-yellow-800"
                        : ""
                }
            />
            <MetricCard
                title="Comentários"
                value={metrics.totalComments}
                icon={MessageSquare}
                description="Total de comentários"
            />
        </div>
    );
}
