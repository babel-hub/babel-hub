import { create } from "zustand";
import type { UserRole } from "../types";

export interface UserProfile {
    id: string;
    name?: string;
    role: UserRole;
    email: string;
    school_id: string | null;
}

interface AuthState {
    token: string | null;
    user: UserProfile | null;
    loading: boolean;
    setAuth: (token: string, user: UserProfile) => void;
    logout: () => void;
}

//We're using localstorage so we save it in the user's browser
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

export const useAuth = create<AuthState>((set) => ({
    token: storedToken || null,
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,

    setAuth: (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user, loading: false });
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
    }
}));