"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Tag } from "lucide-react";
import type { BoardMetric, LabelMetric } from "@/types/metrics.types";

interface ChartsSectionProps {
    cardsByBoard: BoardMetric[];
    cardsByLabel: LabelMetric[];
}

export function ChartsSection({ cardsByBoard, cardsByLabel }: ChartsSectionProps) {
    // Garantir que sempre temos arrays válidos
    const safeCardsByBoard = cardsByBoard || [];
    const safeCardsByLabel = cardsByLabel || [];

    const maxBoardCount = Math.max(...safeCardsByBoard.map((b) => b.cardCount), 1);
    const maxLabelCount = Math.max(...safeCardsByLabel.map((l) => l.cardCount), 1);

    return (
        <div className="grid gap-2 md:grid-cols-2 h-full">
            {/* Cards por Quadro */}
            <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4" />
                        Top 5 Quadros
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    {safeCardsByBoard.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nenhum quadro encontrado.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {safeCardsByBoard.map((board) => (
                                <div key={board.boardId} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium truncate max-w-[140px]">
                                            {board.boardName}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {board.cardCount} {board.cardCount === 1 ? "card" : "cards"}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(board.cardCount / maxBoardCount) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cards por Label */}
            <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Tag className="h-4 w-4" />
                        Top 5 Etiquetas
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    {safeCardsByLabel.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma etiqueta encontrada.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {safeCardsByLabel.map((label) => (
                                <div key={label.labelId} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: label.labelColor }}
                                            />
                                            <span className="font-medium truncate">
                                                {label.labelName}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                                            {label.cardCount} {label.cardCount === 1 ? "card" : "cards"}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(label.cardCount / maxLabelCount) * 100}%`,
                                                backgroundColor: label.labelColor,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
