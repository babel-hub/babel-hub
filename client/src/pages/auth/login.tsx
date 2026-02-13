import { useState } from "react";
import { supabase } from "../../auth/supabase.ts";
import api from "../../api/client.ts";
import { useAuth } from "../../auth/useAuth.ts";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const setAuth = useAuth((s) => s.setAuth);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");

        try {
            const { data, error: supaError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (supaError || !data.session) {
                setError("Incorrect email or password");
                return;
            }

            const token = data.session.access_token;

            localStorage.setItem("token", token);

            const userResponse = await api.get("/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });


            const role = userResponse.data.role;

            setAuth(token, role);

            if (role === "principal") navigate("/principal");
            else if (role === "teacher") navigate("/teacher");
            else if (role === "student") navigate("/student");
            else if (role === "admin") navigate("/admin");

        } catch (err: any) {
            console.error("Login Error:", err);
            localStorage.removeItem("token");
            setError("Login failed. Please try again.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow w-80">
                <h1 className="text-xl font-bold mb-4">Login</h1>

                {error && <p className="text-red-500 mb-2">{error}</p>}

                <input
                    className="border w-full p-2 mb-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="border w-full p-2 mb-4"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="bg-black text-white w-full py-2"
                >
                    Login
                </button>
            </div>
        </div>
    );
}