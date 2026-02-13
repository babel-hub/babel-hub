import {supabase} from "../../auth/supabase.ts";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth.ts";

export const StudentDashboard = () => {
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
        <>
            <h1>Student</h1>
            <button
                className="bg-green-500 px-3 py-2 text-white rounded cursor-pointer hover:bg-green-600 transition"
                onClick={handleLogout}
            >
                Logout
            </button>
        </>
    );
};

export default StudentDashboard;