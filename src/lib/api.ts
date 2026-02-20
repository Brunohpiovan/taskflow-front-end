import axios from "axios";
import { getCookie } from "cookies-next";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Request interceptor — attach JWT from cookie
api.interceptors.request.use((config) => {
    const token = getCookie("auth-token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 globally
// When token expires, clear session and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            // Avoid redirect loop on auth endpoints
            !error.config?.url?.includes("/auth/")
        ) {
            // Dynamic import to avoid circular dependency at module load time
            import("@/stores/auth.store").then(({ useAuthStore }) => {
                useAuthStore.getState().logout();
            });
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
