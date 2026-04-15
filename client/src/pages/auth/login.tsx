import { useState } from "react";
import { supabase } from "../../auth/supabase.ts";
import api from "../../api/client.ts";
import { useAuth } from "../../auth/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "../../components/Loadings.tsx";
import logo from "../../assets/images/logo.png";
import backImg from "../../assets/images/login-back-img.png";
import { LuEye, LuEyeClosed } from "react-icons/lu";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordEye, setPasswordEye] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const setAuth = useAuth((s) => s.setAuth);
    const navigate = useNavigate();

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

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

            if (role === "principal") navigate("/principal/dashboard");
            else if (role === "teacher") navigate("/teacher/dashboard");
            else if (role === "student") navigate("/student/dashboard");
            else if (role === "admin") navigate("/admin/dashboard");

        } catch (err: any) {
            console.error("Login Error:", err);
            localStorage.removeItem("token");

            await supabase.auth.signOut();

            setError("El login falló, vuelve a intentarlo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {loading && ( <LoadingPage title="Iniciando sesión..." /> )}

            <div className="bg-gradient-to-b from-[#f7f7fb] to-[#f9f9fb] p-5 xl:p-10">
                <div
                    className={`w-full h-[calc(100dvh-2.5rem)] xl:h-[calc(100dvh-5rem)] flex items-center justify-center mx-auto max-w-7xl bg-cover lg:bg-contain xl:bg-cover bg-no-repeat bg-center`}
                    style={{ backgroundImage: `url(${backImg})` }}
                >
                    <div className="bg-white shadow p-5 border border-gray-100 max-w-xs w-full flex flex-col gap-4 items-center rounded-xl">
                        <div className="flex w-full justify-center items-center gap-1">
                            <div className="max-w-10 md:max-w-12">
                                <img
                                    alt="Logo de Babel"
                                    src={logo}
                                    className="w-full"
                                    fetchPriority="high"
                                />
                            </div>
                            <h1 className="text-2xl md:text-2xl xl:text-3xl font-bold text-primary">Babel</h1>
                        </div>
                        <div className="text-center">
                            <h3 className="text-primary text-lg lg:text-xl font-semibold md:font-bold mb-2">Iniciar Sesión</h3>
                            <p className="text-gray-500 text-xs max-w-64">Bienvenido de nuevo. Inicia sesión para conectar con tu comunidad educativa.</p>
                        </div>

                        <form onSubmit={handleLogin} className="w-full flex flex-col gap-7">
                            <div>
                                {error && (
                                    <div className="bg-red-shadow text-red-error p-3 rounded-lg text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <input
                                    className="text-custom-black my-3 text-sm md:text-base w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    placeholder="email@ejemplo.com"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <div>
                                    <div className="w-full mb-2 relative">
                                        <input
                                            className="text-custom-black text-sm md:text-base w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            placeholder="Contraseña"
                                            required
                                            type={passwordEye ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="absolute right-4 top-4">
                                            <button
                                                type="button"
                                                className="text-xl text-gray-500 hover:text-gray-700 transition-colors"
                                                onClick={() => setPasswordEye(!passwordEye)}
                                            >
                                                {passwordEye ? <LuEye /> : <LuEyeClosed />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" className="underline text-primary hover:text-primary-darker cursor-pointer text-xs transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-sm md:text-base hover:bg-primary-darker cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl focus:outline-none font-semibold text-white w-full py-3 transition-colors shadow-md"
                            >
                                Acceder
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}