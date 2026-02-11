"use client";

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { CardMember } from "@/types/card.types";
import type { EnvironmentMember } from "@/types/environment.types";

interface CardMembersSelectorProps {
    cardId: string;
    currentMembers: CardMember[];
    environmentMembers: EnvironmentMember[];
    onAddMember: (userId: string) => Promise<void>;
    onRemoveMember: (userId: string) => Promise<void>;
}

export function CardMembersSelector({
    cardId,
    currentMembers,
    environmentMembers,
    onAddMember,
    onRemoveMember,
}: CardMembersSelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);

    // Filter environment members who are not already assigned
    const availableMembers = environmentMembers.filter(
        (envMember) => !currentMembers.some((cm) => cm.userId === envMember.userId)
    );

    const handleAddMember = async (userId: string) => {
        setIsAdding(true);
        try {
            await onAddMember(userId);
            toast.success("Membro adicionado ao card");
        } catch (error) {
            console.error("Failed to add member:", error);
            toast.error("Erro ao adicionar membro");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        setRemovingUserId(userId);
        try {
            await onRemoveMember(userId);
            toast.success("Membro removido do card");
        } catch (error) {
            console.error("Failed to remove member:", error);
            toast.error("Erro ao remover membro");
        } finally {
            setRemovingUserId(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Membros</Label>
                {availableMembers.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={isAdding}
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="text-xs">Adicionar</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                                    Selecione um membro
                                </p>
                                {availableMembers.map((member) => (
                                    <button
                                        key={member.userId}
                                        onClick={() => handleAddMember(member.userId)}
                                        disabled={isAdding}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-left transition-colors disabled:opacity-50"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.name}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Current Members List */}
            {currentMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Nenhum membro atribuído
                </p>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {currentMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-1.5 bg-accent rounded-md pl-1.5 pr-1 py-1 group"
                        >
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="text-[10px]">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium max-w-[120px] truncate">
                                {member.name}
                            </span>
                            <button
                                onClick={() => handleRemoveMember(member.userId)}
                                disabled={removingUserId === member.userId}
                                className="opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded p-0.5 transition-all disabled:opacity-50"
                                title="Remover membro"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
