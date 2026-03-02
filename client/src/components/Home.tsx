import React, {type JSX} from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import LogOutButton from "./LogOutButton.tsx";
import type {UserProfile} from "../auth/useAuth.ts";
import ErrorBoundary from "./ErrorBoundary.tsx";

interface GridItem {
    id: string | number;
    icon: JSX.Element;
    label: string;
    path: string;
}

interface LayoutProps {
    user: UserProfile | null;
    grid: GridItem[];
    children?: React.ReactNode;
}

const roleTranslations: Record<string, string> = {
    principal: "Coordinador",
    teacher: "Profesor",
    student: "Estudiante",
    admin: "Administrador"
};

const DashboardLayout = ({ user, grid }: LayoutProps) => {
    const displayTitle = roleTranslations[user?.role || ""] || "Usuario";
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex flex-row min-h-screen bg-white">
            <div className="border-r border-gray-300 bg-white flex flex-col w-60 p-5 justify-between xl:w-72 h-screen sticky top-0">
                <div>
                    <div className="flex items-center mb-5 justify-center">
                        <h1 className="text-custom-black text-base sm:text-lg font-bold capitalize">
                            {displayTitle}
                        </h1>
                    </div>

                    <div className="flex flex-col items-center mb-5">
                        <div className="lg:w-32 mb-3 lg:h-32 w-28 h-28 bg-primary-shadow rounded-full"></div>
                        <p className="text-custom-black text-lg font-semibold text-center">
                            {user?.name ? user.name.split(" ").slice(0, 2).join(" ") : "Usuario"}
                        </p>
                        <p className="text-gray-500 text-sm font-medium text-center">
                            {user?.email}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {grid.map((item) => {
                            const disabled = item.path === "/unknow";
                            const isActive = location.pathname.startsWith(item.path);

                            // @ts-ignore
                            return (
                                <button
                                    key={item.id}
                                    disabled={disabled}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        flex items-center cursor-pointer transition-colors rounded-xl p-4 justify-center flex-col
                                    ${isActive
                                        ? "bg-primary-shadow text-primary"
                                        : "hover:bg-gray-100 hover:border-gray-200 text-custom-black"
                                    }
                                `}
                                >
                                    <div className={`mb-2 text-3xl ${isActive ? "text-primary" : "text-gray-300"}`}>
                                        {item.icon}
                                    </div>
                                    <p className="font-medium text-xs text-center">{item.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <LogOutButton />
                </div>
            </div>

            <div className="flex-1 p-5 bg-gray-50 overflow-y-auto">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default DashboardLayout;