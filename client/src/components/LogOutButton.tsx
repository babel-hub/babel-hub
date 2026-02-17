import { supabase } from "../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/useAuth.ts";
import PrimaryButton from "./Button.tsx";

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
        <PrimaryButton title="Cerrar Sesión" full={true} onClick={handleLogout}></PrimaryButton>
    );
};

export default LogOutButton;