"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { activityLogsService, ActivityLog } from "@/services/activity-logs.service";

interface ActivityLogProps {
    cardId: string;
}

export function ActivityLogList({ cardId }: ActivityLogProps) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const isFetchingRef = useRef(false);

    const loadPage = useCallback(async (cursor?: string) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        cursor ? setLoadingMore(true) : setLoading(true);

        try {
            const result = await activityLogsService.getByCardId(cardId, cursor);
            setLogs((prev) => cursor ? [...prev, ...result.data] : result.data);
            setNextCursor(result.nextCursor);
        } catch (error) {
            console.error("Failed to load activity logs", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [cardId]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const getActionText = (action: string) => {
        switch (action) {
            case "CREATED": return "criou este card";
            case "UPDATED": return "atualizou este card";
            case "MOVED": return "moveu este card";
            case "MEMBER_ADDED": return "adicionou um membro";
            case "MEMBER_REMOVED": return "removeu um membro";
            default: return action;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <h3 className="font-medium text-base">Atividade</h3>
            </div>

            <div className="space-y-4 mt-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground text-center">Carregando histórico...</p>
                ) : logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center italic">Nenhuma atividade recente.</p>
                ) : (
                    <>
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-sm">
                                <Avatar className="h-6 w-6 mt-0.5">
                                    {log.user?.avatar && <AvatarImage src={log.user.avatar} />}
                                    <AvatarFallback className="text-[10px]">
                                        {log.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-1">
                                        <span className="font-semibold">{log.user?.name || 'Usuário'}</span>
                                        <span>{getActionText(log.action)}</span>
                                    </div>
                                    {log.details && (
                                        <p className="text-muted-foreground text-xs mt-0.5 italic">{log.details}</p>
                                    )}
                                    <span className="text-xs text-muted-foreground block mt-0.5">
                                        {(() => {
                                            try {
                                                const date = new Date(log.createdAt);
                                                if (isNaN(date.getTime())) return 'Data inválida';
                                                return formatDistanceToNow(date, {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                });
                                            } catch {
                                                return 'Data inválida';
                                            }
                                        })()}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {nextCursor && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground gap-2"
                                onClick={() => loadPage(nextCursor)}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                                {loadingMore ? "Carregando..." : "Carregar mais"}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
