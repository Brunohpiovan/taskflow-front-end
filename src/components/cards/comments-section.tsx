"use client";

import { useRef, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, Trash, Paperclip, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { commentsService, Comment } from "@/services/comments.service";
import { useAuthStore } from "@/stores/auth.store";

interface CommentsSectionProps {
    cardId: string;
    isOwner?: boolean;
}

export function CommentsSection({ cardId, isOwner = false }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("O arquivo deve ter no máximo 5MB");
                return;
            }
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim() && !selectedFile) return;

        try {
            setSubmitting(true);
            const comment = await commentsService.create({
                cardId,
                content: newComment.trim() || (selectedFile ? "Enviou um anexo" : ""),
                file: selectedFile || undefined,
            });
            setComments([comment, ...comments]);
            setNewComment("");
            removeSelectedFile();
            toast.success("Comentário adicionado");
        } catch {
            toast.error("Erro ao adicionar comentário");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;

        try {
            await commentsService.delete(commentToDelete);
            setComments(comments.filter((c) => c.id !== commentToDelete));
            toast.success("Comentário removido");
        } catch {
            toast.error("Erro ao remover comentário");
        } finally {
            setCommentToDelete(null);
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
                    {selectedFile && (
                        <div className="relative inline-block mb-2 group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded border object-cover" />
                            ) : (
                                <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm max-w-[150px] truncate">{selectedFile.name}</span>
                                </div>
                            )}
                            <button
                                onClick={removeSelectedFile}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    <Textarea
                        placeholder="Escreva um comentário..."
                        className="min-h-[80px] resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                title="Anexar arquivo"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={(!newComment.trim() && !selectedFile) || submitting}
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
                                    {(isOwner || user?.id === comment.userId) && (
                                        <button
                                            onClick={() => setCommentToDelete(comment.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap break-all">{comment.content}</p>
                                {comment.attachments && comment.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {comment.attachments.map((attachment) => (
                                            <div key={attachment.id} className="block">
                                                {attachment.type.startsWith("image/") ? (
                                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-xs">
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.filename}
                                                            className="rounded border max-h-48 object-cover hover:opacity-90 transition-opacity"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded border hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors w-fit"
                                                    >
                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm underline decoration-blue-500/30">{attachment.filename}</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar este comentário? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
