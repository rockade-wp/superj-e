import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { login as loginApi } from "../api/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    nip: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    useEffect(() => {
        if (token) {
            // TODO: Anda bisa menambahkan endpoint /me di backend untuk validasi token dan获取 user info
            // Untuk sekarang, kita asumsikan token valid
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        try {
            const response = await loginApi(email, password);
            const { token: newToken, user: userData } = response.data;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{ user, token, login, logout, isAuthenticated: !!token }}
        >
            {children}
        </AuthContext.Provider>
    );
};
