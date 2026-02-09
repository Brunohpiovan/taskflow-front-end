"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { ActivityItem } from "@/types/metrics.types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    // Garantir que sempre temos um array válido
    const safeActivities = activities || [];

    if (safeActivities.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4" />
                        Atividade Recente
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                        Nenhuma atividade recente encontrada.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4" />
                    Atividade Recente
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <div className="space-y-3">
                    {safeActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-2 pb-3 border-b last:border-0 last:pb-0"
                        >
                            <div className="flex-1 space-y-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                    {activity.action} o card
                                </p>
                                {activity.cardTitle && (
                                    <p className="text-sm text-primary font-medium truncate">
                                        "{activity.cardTitle}"
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.createdAt), {
                                        addSuffix: true,
                                        locale: ptBR,
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
