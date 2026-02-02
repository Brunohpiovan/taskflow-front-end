import { useEffect } from "react";
import { useEnvironmentsStore } from "@/stores/environments.store";

export function useEnvironments() {
  const environments = useEnvironmentsStore((s) => s.environments);
  const currentEnvironment = useEnvironmentsStore((s) => s.currentEnvironment);
  const isLoading = useEnvironmentsStore((s) => s.isLoading);
  const error = useEnvironmentsStore((s) => s.error);
  const fetchEnvironments = useEnvironmentsStore((s) => s.fetchEnvironments);
  const createEnvironment = useEnvironmentsStore((s) => s.createEnvironment);
  const updateEnvironment = useEnvironmentsStore((s) => s.updateEnvironment);
  const deleteEnvironment = useEnvironmentsStore((s) => s.deleteEnvironment);
  const setCurrentEnvironment = useEnvironmentsStore((s) => s.setCurrentEnvironment);

  useEffect(() => {
    fetchEnvironments().catch(() => {});
  }, [fetchEnvironments]);

  return {
    environments,
    currentEnvironment,
    isLoading,
    error,
    fetchEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setCurrentEnvironment,
  };
}
