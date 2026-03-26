import axios from "axios";
import toast from "react-hot-toast";

const DYNAMIC_URL = import.meta.env.VITE_API_URL;

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
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }

        if (error.response && error.response.status === 500) {
            console.error("Internal Server Error:", error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;


//fetch
export async function apiFetch(
    url: string,
    options: RequestInit = {}
) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
    });

    if (!response.ok) throw new Error('API error');

    return response.json();
}
