import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../auth/useAuth.ts";
import {supabase} from "../auth/supabase.ts";

const DYNAMIC_URL = import.meta.env.VITE_API_URL;

const handleExpiredToken = async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Error signing out of Supabase:", error);
    } finally {
        useAuth.getState().logout();
        window.location.href = ('/login');
    }
};

const api = axios.create({
    baseURL: DYNAMIC_URL || "http://localhost:4000"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 429) {
            toast.error("Has realizado demasiadas solicitudes. Por favor, espera unos minutos.", {
                id: "rate-limit-toast",
                duration: 5000,
            });
        }

        if (error.response && error.response.status === 401) {
            if (window.location.pathname !== "/login") {
                handleExpiredToken();
            }
        }

        if (error.response && error.response.status === 500) {
            console.error("Internal Server Error:", error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;
