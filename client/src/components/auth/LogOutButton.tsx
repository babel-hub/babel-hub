import { supabase } from "../../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth.ts";
import { useState } from "react";
import { LuLogOut } from "react-icons/lu";

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
        <button
            onClick={handleLogout}
            type="button"
            disabled={loading}
            className={`w-full p-2 cursor-pointer flex items-center text-sm justify-start gap-2 text-red-500 rounded-xl hover:bg-gray-50
                        ${loading && 'cursor-not-allowed opacity-75'}`}
        >
            <LuLogOut />
            Cerrar sesión
        </button>
    );
};

export default LogOutButton;