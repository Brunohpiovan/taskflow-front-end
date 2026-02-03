"use client";

import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/types/auth.types";

interface DashboardHeaderProps {
    initialUser: User | null;
}

export function DashboardHeader({ initialUser }: DashboardHeaderProps) {
    // Inicializamos o store com os dados do servidor se disponível
    // Mas como o auth store é persistido, ele pode se hidratar com dados do localStorage também.
    // Vamos usar o dado do servidor como fallback ou prioridade dependendo da estratégia.
    // Neste caso, vamos usar o user vindo do props para renderizar no servidor/primeira carga
    // e sincronizar com o useAuthStore se necessário.

    const user = useAuthStore((s) => s.user) || initialUser;

    return (
        <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Olá, {user?.name?.split(" ")[0] ?? "usuário"}
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
                Bem-vindo de volta ao TaskFlow.
            </p>
        </div>
    );
}
