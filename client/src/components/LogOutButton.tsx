import { supabase } from "../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/useAuth.ts";

export const LogOutButton = () => {
    const navigate = useNavigate();

    // 1. Grab your logout function from your Zustand store
    const logoutAction = useAuth((s) => s.logout);

    const handleLogout = async () => {
        await supabase.auth.signOut();

        // Step 2: Clear your Zustand state AND LocalStorage
        // (Your useAuth.logout function already handles the localStorage.removeItem!)
        logoutAction();

        // Step 3: Send them back to the front door
        navigate("/login");
    };

    return (
        <button
            className="bg-primary-shadow w-full hover:bg-primary-darker px-3 py-2 text-primary-darker font-semibold hover:text-white rounded-lg cursor-pointer transition-colors"
            onClick={handleLogout}
        >
            Cerrar sesión
        </button>
    );
};

export default LogOutButton;