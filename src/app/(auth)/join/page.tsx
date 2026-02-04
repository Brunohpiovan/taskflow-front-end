"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { environmentsService } from "@/services/environments.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

function JoinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Link de convite inválido.");
            router.push("/dashboard");
        }
    }, [token, router]);

    const handleAccept = async () => {
        if (!token) return;
        setLoading(true);
        const toastId = toast.loading("Aceitando convite...");
        try {
            const response = await environmentsService.acceptInvite(token);
            toast.success("Convite aceito!", { id: toastId });
            router.push(`/environments/${response.environmentSlug}`);
        } catch (error) {
            console.error("Accept invite error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast.error(err.response?.data?.message || "Erro ao aceitar convite.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Card className="border-0 shadow-soft rounded-2xl overflow-hidden w-full max-w-md">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="relative h-16 w-full flex justify-center mb-4">
                        <Image
                            src="/images/icone.png"
                            alt={APP_NAME}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Você foi convidado!</CardTitle>
                    <CardDescription className="text-base">
                        Faça login ou crie uma conta para aceitar o convite e colaborar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button asChild className="w-full h-11 text-base font-medium">
                        <Link href={`/login?callbackUrl=/join?token=${token}`}>Entrar</Link>
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider text-muted-foreground">
                            <span className="bg-card px-3">ou</span>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="w-full h-11 border-2">
                        <Link href={`/register?callbackUrl=/join?token=${token}`}>Criar conta</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-soft rounded-2xl overflow-hidden w-full max-w-md">
            <CardHeader className="space-y-1 text-center pb-2">
                <div className="relative h-16 w-full flex justify-center mb-4">
                    <Image
                        src="/images/icone.png"
                        alt={APP_NAME}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Convite de Colaboração</CardTitle>
                <CardDescription className="text-base">
                    Você foi convidado para participar de um ambiente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Logado como</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                </div>
                <div className="space-y-3">
                    <Button onClick={handleAccept} disabled={loading} className="w-full h-11 text-base font-medium">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Aceitar Convite
                    </Button>
                    <Button variant="ghost" asChild className="w-full h-11">
                        <Link href="/dashboard">Cancelar</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function JoinPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                <JoinContent />
            </Suspense>
        </div>
    );
}
