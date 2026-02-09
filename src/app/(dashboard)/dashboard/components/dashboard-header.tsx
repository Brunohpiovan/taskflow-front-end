"use client";

import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/types/auth.types";
import { Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface DashboardHeaderProps {
    initialUser: User | null;
}

export function DashboardHeader({ initialUser }: DashboardHeaderProps) {
    const user = useAuthStore((s) => s.user) || initialUser;
    const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        {getGreeting()}, {user?.name?.split(" ")[0] ?? "usuário"}!
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="capitalize">{currentDate}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={ROUTES.METRICS}>
                        Ver Métricas
                    </Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href={ROUTES.ENVIRONMENTS}>
                        Criar Ambiente
                    </Link>
                </Button>
            </div>
        </div>
    );
}
