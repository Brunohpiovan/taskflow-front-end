"use client";

import { useEffect, useRef } from "react";
import { useMetricsStore } from "@/stores/metrics.store";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function MetricsPage() {
    const { metrics, isLoading, fetchMetrics } = useMetricsStore();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchMetrics().catch(() => { });
        }
    }, [fetchMetrics]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col space-y-2 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Métricas</h2>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-3">
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-5 w-10 mb-1" />
                                <Skeleton className="h-2 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="h-full flex flex-col space-y-2 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Métricas</h2>
                </div>
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">
                            Erro ao carregar métricas. Tente novamente.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-2 p-4 overflow-hidden">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold tracking-tight">Métricas</h2>
            </div>

            {/* Métricas Principais */}
            <div className="flex-shrink-0">
                <MetricsGrid metrics={metrics} />
            </div>

            {/* Gráficos e Atividades */}
            <div className="grid gap-2 lg:grid-cols-3 flex-1 min-h-0">
                <div className="lg:col-span-2">
                    <ChartsSection
                        cardsByBoard={metrics.cardsByBoard}
                        cardsByLabel={metrics.cardsByLabel}
                    />
                </div>
                <ActivityFeed activities={metrics.recentActivity} />
            </div>
        </div>
    );
}
