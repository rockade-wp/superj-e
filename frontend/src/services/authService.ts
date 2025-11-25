// ==================== src/services/authService.ts ====================
import api from "./api";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
} from "../types";

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>("/auth/login", data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<User> {
        const response = await api.post<User>("/auth/register", data);
        return response.data;
    },

    async getUsers(): Promise<User[]> {
        const response = await api.get<User[]>("/auth/users");
        return response.data;
    },

    async updateUser(userId: string, data: Partial<User>): Promise<User> {
        const response = await api.patch<{ user: User }>(
            `/auth/users/${userId}`,
            data
        );
        return response.data.user;
    },

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/auth/users/${userId}`);
    },

    async updatePassword(data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<User> {
        const response = await api.patch<{ user: User }>(
            "/auth/update-password",
            data
        );
        return response.data.user;
    },
};
