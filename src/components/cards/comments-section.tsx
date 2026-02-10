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
        <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                Comentários
                {comments.length > 0 && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">
                        {comments.length}
                    </span>
                )}
            </h3>

            <div className="bg-white dark:bg-slate-900 border rounded-lg p-4 shadow-sm">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <div className="relative">
                            <Textarea
                                placeholder="Escreva um comentário..."
                                className="min-h-[100px] resize-none pr-12 py-3"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />

                            {/* Attachment Button inside Textarea area */}
                            <div className="absolute bottom-3 right-3">
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
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Anexar arquivo"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* File Preview */}
                        {selectedFile && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                {previewUrl ? (
                                    <div className="relative h-12 w-12 shrink-0 rounded overflow-hidden border">
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 shrink-0 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(0)} KB
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                    onClick={removeSelectedFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-end pt-1">
                            <Button
                                onClick={handleSubmit}
                                disabled={(!newComment.trim() && !selectedFile) || submitting}
                                className="px-6"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Enviando...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Comentar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm">Carregando comentários...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Avatar className="h-10 w-10 mt-1 border-2 border-white dark:border-slate-950 shadow-sm">
                                <AvatarImage src={comment.user?.avatar} referrerPolicy="no-referrer" />
                                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 font-medium">
                                    {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="bg-white dark:bg-slate-900 border rounded-2xl rounded-tl-none p-4 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{comment.user?.name || 'Usuário'}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 before:content-['•'] before:mr-1">
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setCommentToDelete(comment.id)}
                                            >
                                                <Trash className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {comment.content && (
                                        <p className="text-sm whitespace-pre-wrap break-all leading-relaxed text-slate-700 dark:text-slate-300">
                                            {comment.content}
                                        </p>
                                    )}

                                    {comment.attachments && comment.attachments.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {comment.attachments.map((attachment) => (
                                                <div key={attachment.id} className="inline-block">
                                                    {attachment.type.startsWith("image/") ? (
                                                        <a
                                                            href={attachment.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block overflow-hidden rounded-lg border hover:ring-2 hover:ring-primary/50 transition-all max-w-[200px]"
                                                        >
                                                            <img
                                                                src={attachment.url}
                                                                alt={attachment.filename}
                                                                className="max-h-40 w-auto object-cover hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={attachment.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30 transition-all group/file"
                                                        >
                                                            <div className="p-2 bg-white dark:bg-slate-900 rounded border text-blue-600 dark:text-blue-400 group-hover/file:text-primary transition-colors">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium truncate max-w-[150px] decoration-primary/30 group-hover/file:underline">
                                                                    {attachment.filename}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                                    {attachment.filename.split('.').pop() || 'Arquivo'}
                                                                </span>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
