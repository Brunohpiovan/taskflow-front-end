import { serverApi } from "./server-api";
import type { User } from "@/types/auth.types";

export const serverAuthService = {
    getProfile: async (): Promise<User> => {
        return serverApi.get<User>("/auth/me");
    },
};
