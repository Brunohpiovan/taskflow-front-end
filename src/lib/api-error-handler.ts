import { AxiosError } from "axios";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";

export function handleApiError(error: unknown): void {
  if (!(error instanceof AxiosError)) {
    toast.error("Erro inesperado. Tente novamente.");
    return;
  }

  const data = error.response?.data as ApiError | undefined;
  const message = data?.message ?? "Erro inesperado";
  const status = error.response?.status;

  switch (status) {
    case 400:
      toast.error(`Dados inválidos: ${message}`);
      break;
    case 401:
      toast.error("Sessão expirada. Faça login novamente.");
      break;
    case 403:
      toast.error("Você não tem permissão para esta ação.");
      break;
    case 404:
      toast.error("Recurso não encontrado.");
      break;
    case 500:
      toast.error("Erro no servidor. Tente novamente mais tarde.");
      break;
    default:
      toast.error(message);
  }
}
