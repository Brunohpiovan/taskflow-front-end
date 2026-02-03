"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { environmentSchema, type EnvironmentFormData } from "@/lib/validations";
import type { Environment } from "@/types/environment.types";

interface EnvironmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EnvironmentFormData) => Promise<void>;
  defaultValues?: Partial<Environment>;
  title?: string;
  description?: string;
}

export function EnvironmentForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title = "Novo ambiente",
  description = "Crie um ambiente para organizar seus quadros e tarefas.",
}: EnvironmentFormProps) {
  const isEditing = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
      });
    }
  }, [open, defaultValues, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onFormSubmit = async (data: EnvironmentFormData) => {
    await onSubmit(data);
    handleOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar ambiente" : title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Trabalho, Faculdade, Pessoal"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Breve descrição do ambiente"
              {...register("description")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
