import axios from "axios";
import { getCookie } from "cookies-next";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
    const token = getCookie("auth-token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
