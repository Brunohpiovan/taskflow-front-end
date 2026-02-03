"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { profileSchema, type ProfileFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { handleApiError } from "@/lib/api-error-handler";
import { toast } from "sonner";

export default function MeusDadosPage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Se usuário já existe, preenche form e libera
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
      });
      setProfileLoaded(true);
    }
    // Se não existe, NÃO buscamos manualmente. Esperamos o AuthProvider.
    // Timeout de segurança caso o AuthProvider falhe ou demore demais
    else {
      const timer = setTimeout(() => {
        setProfileLoaded(true);
      }, 2000); // 2 segundos de tolerância
      return () => clearTimeout(timer);
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty) {
      toast.info("Nenhuma alteração realizada.");
      return;
    }

    const payload: { name?: string; email?: string; password?: string; confirmPassword?: string } = {
      name: data.name.trim(),
      email: data.email.trim(),
    };
    if (data.password && data.password.length > 0 && data.confirmPassword && data.confirmPassword.length > 0) {
      payload.password = data.password;
      payload.confirmPassword = data.confirmPassword;
    }
    try {
      await updateProfile(payload);
      reset(
        { name: payload.name, email: payload.email ?? "", password: "", confirmPassword: "" },
        { keepDirty: false }
      );
      toast.success("Dados atualizados com sucesso.");
    } catch {
      // handleApiError já mostra o toast
    }
  };

  if (!profileLoaded) {
    return (
      <div className="space-y-6">
        <PageHeader title="Meus Dados" description="Carregando..." />
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Dados"
        description="Visualize e altere seus dados pessoais. Deixe a senha em branco para não alterá-la."
      />
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-xl border-2 border-border/50">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Dados pessoais</CardTitle>
              <CardDescription>Nome, email e senha. A senha nunca é exibida.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
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
              <Label htmlFor="password">Nova senha (deixe em branco para não alterar)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword((v) => !v)}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={isLoading}>
              Salvar alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
