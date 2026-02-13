import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth.ts";
import type { JSX } from "react";

export default function ProtectedRoute({ children, role }: {
    children: JSX.Element;
    role?: string;
}) {
    const { token, role: userRole } = useAuth();

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/login" />;
    }

    return children;
}
