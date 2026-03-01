import { supabase } from "../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/useAuth.ts";
import { PrimaryButton } from "./Buttons.tsx";

export const LogOutButton = () => {
    const navigate = useNavigate();

    const logoutAction = useAuth((s) => s.logout);

    const handleLogout = async () => {
        await supabase.auth.signOut();

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