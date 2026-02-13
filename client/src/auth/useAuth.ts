import { create } from "zustand";
import type { UserRole } from "../types";

interface AuthState {
    token: string | null;
    role: UserRole | null;
    loading: boolean;
    setAuth: (token: string, role: UserRole) => void;
    logout: () => void;
}


//We're using localstorage so we save it in the user's browser

const storedToken = localStorage.getItem("token");

export const useAuth = create<AuthState>((set) => ({
    token: storedToken || null,
    role: null,
    loading: false,

    setAuth: (token, role) => {
        localStorage.setItem("token", token);
        set({ token, role, loading: false });
    },
    logout: () => {
        localStorage.removeItem("token");
        set({ token: null, role: null });
    }
}));