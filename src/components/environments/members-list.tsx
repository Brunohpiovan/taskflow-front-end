import { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, UserPlus } from "lucide-react";
import { environmentsService } from "@/services/environments.service";
import { toast } from "sonner";
import { EnvironmentMember } from "@/types/environment.types";
import { useAuthStore } from "@/stores/auth.store";

interface MembersListProps {
    environmentId: string;
}

export function MembersList({ environmentId }: MembersListProps) {
    const [members, setMembers] = useState<EnvironmentMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const { user } = useAuthStore();

    // Allow invite if members list is empty OR if current user is found and is OWNER
    // Allow invite if members list is empty OR if current user is found and is OWNER (or the only member)
    const isOwner = useMemo(() => {
        if (members.length === 0) return true;
        if (!user) return false;

        const currentMember = members.find(m =>
            String(m.userId) === String(user.id) ||
            (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
        );

        if (!currentMember) return false;

        // User is owner if explicitly OWNER role OR if they are the only member in the list
        return currentMember.role === 'OWNER' || members.length === 1;
    }, [members, user]);

    const fetchMembers = useCallback(async () => {
        try {
            const data = await environmentsService.getMembers(environmentId);
            setMembers(data);
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [environmentId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRemoveMember = async (memberId: string) => {
        try {
            await environmentsService.removeMember(environmentId, memberId);
            toast.success("Membro removido com sucesso.");
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch {
            toast.error("Erro ao remover membro.");
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setInviteLoading(true);
        try {
            await environmentsService.createInvite(environmentId, email);
            toast.success("Convite enviado com sucesso!");
            setEmail("");
        } catch {
            toast.error("Erro ao enviar convite. Verifique se o email está correto e se o usuário existe.");
        } finally {
            setInviteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {isOwner && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Convidar novo membro</h4>
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <Input
                            placeholder="Email do usuário"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={inviteLoading}>
                            {inviteLoading ? <div className="animate-spin mr-2">C</div> : <UserPlus className="h-4 w-4 mr-2" />}
                            Convidar
                        </Button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Membros</h4>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card/50 border-dashed">
                        <p className="text-sm text-muted-foreground">Nenhum membro encontrado neste ambiente.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-muted font-medium">
                                        {member.role === 'OWNER' ? 'Dono' : 'Membro'}
                                    </span>
                                    {/* Only show delete button if current user is owner AND not removing themselves */}
                                    {isOwner && member.userId !== user?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                            onClick={() => handleRemoveMember(member.id)}
                                            title="Remover membro"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
