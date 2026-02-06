"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, Trash } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { commentsService, Comment } from "@/services/comments.service";
import { useAuthStore } from "@/stores/auth.store";

interface CommentsSectionProps {
    cardId: string;
}

export function CommentsSection({ cardId }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        const loadComments = async () => {
            try {
                setLoading(true);
                const data = await commentsService.getByCardId(cardId);
                setComments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setLoading(false);
            }
        };
        loadComments();
    }, [cardId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const comment = await commentsService.create({
                cardId,
                content: newComment.trim(),
            });
            setComments([comment, ...comments]);
            setNewComment("");
            toast.success("Comentário adicionado");
        } catch {
            toast.error("Erro ao adicionar comentário");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await commentsService.delete(id);
            setComments(comments.filter((c) => c.id !== id));
            toast.success("Comentário removido");
        } catch {
            toast.error("Erro ao remover comentário");
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-base">Comentários</h3>

            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} referrerPolicy="no-referrer" />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Escreva um comentário..."
                        className="min-h-[80px] resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || submitting}
                        >
                            <Send className="mr-2 h-3 w-3" />
                            Comentar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mt-6">
                {loading ? (
                    <p className="text-sm text-muted-foreground text-center">Carregando comentários...</p>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center italic">Nenhum comentário ainda.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={comment.user?.avatar} referrerPolicy="no-referrer" />
                                <AvatarFallback>{comment.user?.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-3 rounded-md space-y-1 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{comment.user?.name || 'Usuário'}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(() => {
                                                try {
                                                    const date = new Date(comment.createdAt);
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
                                    {user?.id === comment.userId && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap break-all">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
