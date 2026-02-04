"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";
import { APP_NAME, API_BASE_URL } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";
import { GitHubIcon } from "@/components/icons/github-icon";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      setLoginError("Falha ao entrar com Google ou GitHub. Tente novamente.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await login(data);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setLoginError(
        status === 429
          ? "Muitas tentativas de login. Aguarde alguns minutos e tente novamente."
          : "Email ou senha incorretos. Verifique e tente novamente."
      );
    }
  };

  return (
    <Card className="border-0 shadow-soft rounded-2xl overflow-hidden">
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
        <CardTitle className="text-2xl font-bold tracking-tight">{APP_NAME}</CardTitle>
        <CardDescription className="text-base">Bem-vindo de volta. Entre na sua conta.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="flex justify-end mt-1 relative z-10">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline px-1 py-0.5"
              >
                Esqueci minha senha
              </Link>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {loginError && (
            <p className="text-sm text-destructive text-center">{loginError}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-11 text-base font-medium" isLoading={isLoading}>
            Entrar
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-muted-foreground">
              <span className="bg-card px-3">ou continue com</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-11 border-2"
              onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)}
            >
              <GoogleIcon size={18} />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 h-11 border-2"
              onClick={() => (window.location.href = `${API_BASE_URL}/auth/github`)}
            >
              <GitHubIcon size={18} />
              GitHub
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground pt-1">
            Não tem conta?{" "}
            <Link href="/register" className="text-icon font-medium underline-offset-4 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-0 shadow-soft rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse" />
            </div>
            <div className="h-6 w-32 bg-muted rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded-lg mx-auto animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
          </CardContent>
          <CardFooter>
            <div className="h-11 w-full bg-muted rounded-lg animate-pulse" />
          </CardFooter>
        </Card>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
