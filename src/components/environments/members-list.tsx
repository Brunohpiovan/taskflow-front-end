import { useState, useEffect, useCallback } from "react";
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

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Membros</h4>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
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
                                    {/* Only show delete button if current user is not removing themselves logic handled in backend but frontend validation helps */}
                                    {member.userId !== user?.id && (
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
