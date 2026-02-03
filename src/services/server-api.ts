import { cookies } from "next/headers";
import { STORAGE_KEYS } from "@/lib/constants";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type RequestConfig = RequestInit & {
    params?: Record<string, string>;
};

async function fetchAPI<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const cookieStore = cookies();
    const token = cookieStore.get(STORAGE_KEYS.AUTH_TOKEN)?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...config.headers,
    };

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const queryString = config.params
        ? "?" + new URLSearchParams(config.params).toString()
        : "";

    const response = await fetch(`${baseURL}${endpoint}${queryString}`, {
        ...config,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Opcional: Redirecionar para login se necessário, mas geralmente deixamos o middleware tratar
            throw new Error("Unauthorized");
        }
        throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();

    // Adaptar resposta da API padrão { data: ... }
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data;
    }

    return json;
}

export const serverApi = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
        fetchAPI<T>(endpoint, { ...config, method: "GET" }),

    post: <T>(endpoint: string, body: any, config?: RequestConfig) =>
        fetchAPI<T>(endpoint, {
            ...config,
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: <T>(endpoint: string, body: any, config?: RequestConfig) =>
        fetchAPI<T>(endpoint, {
            ...config,
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
        fetchAPI<T>(endpoint, { ...config, method: "DELETE" }),
};
