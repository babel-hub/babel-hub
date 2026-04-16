import { supabase } from "../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/useAuth.ts";
import { useState } from "react";
import AuthButton from "./AuthButtons.tsx";

export const LogOutButton = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const logoutAction = useAuth((s) => s.logout);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            logoutAction();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthButton
            type="button"
            title="Cerrar Sesión"
            onClick={handleLogout}
            disable={loading}
        />
    );
};

export default LogOutButton;