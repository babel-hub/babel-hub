import { useState } from "react";
import { supabase } from "../../auth/supabase.ts";
import api from "../../api/client.ts";
import { useAuth } from "../../auth/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "../../components/Loadings.tsx";
import logo from "../../assets/images/logo.png";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const setAuth = useAuth((s) => s.setAuth);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const { data, error: supaError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (supaError || !data.session) {
                setError("La cuenta o la contraseña es incorrecta.");
                return;
            }


            const token = data.session.access_token;

            localStorage.setItem("token", token);

            const userResponse = await api.get("/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });


            const userData = userResponse.data;
            const role = userData.role;

            setAuth(token, userData);

            if (role === "principal") navigate("/principal");
            else if (role === "teacher") navigate("/teacher");
            else if (role === "student") navigate("/student");
            else if (role === "admin") navigate("/admin");

        } catch (err: any) {
            console.error("Login Error:", err);
            localStorage.removeItem("token");
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {loading && ( <LoadingPage title="Iniciando sesión..." /> )}

            <div className="min-h-screen flex flex-col items-center justify-center bg-page">
                <div>
                    <img
                        alt="Logo"
                        src={logo}
                        className="max-w-28 md:max-w-38"
                    />
                </div>
                <div className="bg-transparent p-6 rounded-xl w-80">
                    <h1 className="text-xl md:text-2xl font-bold text-primary mb-6 text-center">Babel</h1>

                    {error && (
                        <div className="bg-red-shadow text-red-error p-3 rounded-lg text-sm mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <input
                        className="text-custom-black text-sm md:text-base w-full border border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="text-custom-black text-sm md:text-base w-full border border-gray-200 rounded-xl p-3 mb-6 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        onClick={handleLogin}
                        className="bg-primary text-sm md:text-base hover:bg-primary-darker cursor-pointer rounded-xl focus:outline-none font-semibold text-white w-full py-3 transition-colors shadow-md"
                    >
                        Acceder
                    </button>
                </div>
            </div>
        </>
    );
}