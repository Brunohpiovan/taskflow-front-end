"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { authService } from "@/services/auth.service";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error("Token de redefinição inválido ou ausente.");
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.resetPassword(token, data.password);
            setSuccess(true);
            toast.success("Senha redefinida com sucesso!");
            setTimeout(() => router.push("/login"), 3000);
        } catch {
            toast.error("Erro ao redefinir senha. O link pode ter expirado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                    <h3 className="font-medium text-destructive">Link inválido</h3>
                    <p className="text-sm text-muted-foreground">
                        O link de redefinição de senha é inválido ou está ausente.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/forgot-password">Solicitar novo link</Link>
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium">Senha alterada!</h3>
                    <p className="text-sm text-muted-foreground">
                        Sua senha foi atualizada com sucesso. Você será redirecionado para o login.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/login">Ir para o login</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">Toggle password visibility</span>
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
                        {...register("confirmPassword")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">Toggle password visibility</span>
                    </Button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Redefinir senha
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                <CardTitle className="text-2xl font-bold tracking-tight">Redefinir senha</CardTitle>
                <CardDescription className="text-base">
                    Crie uma nova senha para sua conta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<div className="text-center">Carregando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
                <Link
                    href="/login"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                </Link>
            </CardFooter>
        </Card>
    );
}
