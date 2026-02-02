"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginWithToken = useAuthStore((s) => s.loginWithToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam === "oauth_failed") {
      setError("Falha ao entrar com Google ou GitHub. Tente novamente.");
      return;
    }

    if (!token) {
      setError("Token não recebido. Tente fazer login novamente.");
      return;
    }

    let cancelled = false;
    loginWithToken(token)
      .then(() => {
        if (!cancelled) {
          toast.success("Login realizado com sucesso.");
          router.replace(ROUTES.DASHBOARD);
          router.refresh();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Não foi possível completar o login. Tente novamente.");
          toast.error("Erro ao completar login.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, loginWithToken, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
        <p className="text-center text-destructive">{error}</p>
        <Button asChild>
          <Link href={ROUTES.LOGIN}>Voltar ao login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <Skeleton className="h-8 w-48" />
      <p className="text-sm text-muted-foreground">Completando login...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
          <Skeleton className="h-8 w-48" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
