import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuth,
  };
}
