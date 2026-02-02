"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EnvironmentForm } from "@/components/environments/environment-form";
import { EnvironmentList } from "@/components/environments/environment-list";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useEnvironmentsStore } from "@/stores/environments.store";
import type { Environment } from "@/types/environment.types";
import type { EnvironmentFormData } from "@/lib/validations";
import { toast } from "sonner";

export default function EnvironmentsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState<Environment | null>(null);
  const [environmentToDelete, setEnvironmentToDelete] = useState<Environment | null>(null);

  const environments = useEnvironmentsStore((s) => s.environments);
  const isLoading = useEnvironmentsStore((s) => s.isLoading);
  const fetchEnvironments = useEnvironmentsStore((s) => s.fetchEnvironments);
  const createEnvironment = useEnvironmentsStore((s) => s.createEnvironment);
  const updateEnvironment = useEnvironmentsStore((s) => s.updateEnvironment);
  const deleteEnvironment = useEnvironmentsStore((s) => s.deleteEnvironment);

  useEffect(() => {
    fetchEnvironments().catch(() => {});
  }, [fetchEnvironments]);

  const handleCreate = async (data: EnvironmentFormData) => {
    await createEnvironment({
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
    });
    toast.success("Ambiente criado com sucesso.");
  };

  const handleUpdate = async (data: EnvironmentFormData) => {
    if (!environmentToEdit) return;
    await updateEnvironment(environmentToEdit.id, {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
    });
    toast.success("Ambiente atualizado com sucesso.");
    setEnvironmentToEdit(null);
  };

  const handleEdit = (env: Environment) => {
    setEnvironmentToEdit(env);
    setFormOpen(true);
  };

  const handleDeleteClick = (env: Environment) => {
    setEnvironmentToDelete(env);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!environmentToDelete) return;
    await deleteEnvironment(environmentToDelete.id);
    toast.success("Ambiente excluído.");
    setEnvironmentToDelete(null);
  };

  const handleFormSubmit = async (data: EnvironmentFormData) => {
    if (environmentToEdit) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const openCreateForm = () => {
    setEnvironmentToEdit(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Ambientes"
        description="Organize seus quadros e tarefas por ambiente."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Novo ambiente
          </Button>
        }
      />

      <EnvironmentList
        environments={environments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onCreateClick={openCreateForm}
      />

      <EnvironmentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEnvironmentToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={environmentToEdit ?? undefined}
        title={environmentToEdit ? "Editar ambiente" : "Novo ambiente"}
        description={environmentToEdit ? "Atualize os dados do ambiente." : "Crie um ambiente para organizar seus quadros e tarefas."}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => {
          setConfirmDeleteOpen(open);
          if (!open) setEnvironmentToDelete(null);
        }}
        title="Excluir ambiente"
        description={`Tem certeza que deseja excluir "${environmentToDelete?.name}"? Todos os quadros e cards serão removidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
