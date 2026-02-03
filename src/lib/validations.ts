import { z } from "zod";
import { CARD_DESCRIPTION_MAX_LENGTH } from "@/lib/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória"),
});


export const registerSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
    acceptTerms: z.boolean().refine((val) => val === true, "Você deve aceitar os termos de uso"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const environmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const boardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
});

export const cardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").min(1, "Título deve ter no mínimo 1 caractere"),
  description: z
    .string()
    .max(CARD_DESCRIPTION_MAX_LENGTH, `A descrição deve ter no máximo ${CARD_DESCRIPTION_MAX_LENGTH} caracteres`)
    .optional()
    .or(z.literal("")),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  boardId: z.string().optional(),
});

export const profileSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    { message: "As senhas não coincidem", path: ["confirmPassword"] }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EnvironmentFormData = z.infer<typeof environmentSchema>;
export type BoardFormData = z.infer<typeof boardSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
