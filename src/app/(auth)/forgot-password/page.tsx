"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Mail } from "lucide-react";
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
import { APP_NAME } from "@/lib/constants";

const forgotPasswordSchema = z.object({
    email: z.string().email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        try {
            await authService.forgotPassword(data.email);
            setSuccess(true);
            toast.success("Email enviado com sucesso!");
        } catch {
            toast.error("Ocorreu um erro. Tente novamente mais tarde.");
        } finally {
            setIsSubmitting(false);
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
                <CardTitle className="text-2xl font-bold tracking-tight">Recuperar senha</CardTitle>
                <CardDescription className="text-base">
                    Digite seu email para receber um link de redefinição.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium">Email enviado!</h3>
                            <p className="text-sm text-muted-foreground">
                                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="w-full h-11 text-base font-medium">
                            <Link href="/login">Voltar para o login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-medium" isLoading={isSubmitting}>
                            Enviar link
                        </Button>
                    </form>
                )}
            </CardContent>
            {!success && (
                <CardFooter className="flex justify-center border-t p-4">
                    <Link
                        href="/login"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o login
                    </Link>
                </CardFooter>
            )}
        </Card>
    );
}
