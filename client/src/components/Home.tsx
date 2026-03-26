import React, { useState, type JSX } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import LogOutButton from "./LogOutButton.tsx";
import type { UserProfile } from "../auth/useAuth.ts";
import ErrorBoundary from "./ErrorBoundary.tsx";
import { HiMenu, HiX } from "react-icons/hi";

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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-gray-50">

            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <h1 className="text-custom-black text-lg font-bold capitalize">
                    {displayTitle}
                </h1>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-2xl text-custom-black hover:text-primary transition-colors focus:outline-none"
                >
                    <HiMenu />
                </button>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-custom-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 xl:w-72 bg-white border-r border-gray-200 p-4 flex flex-col justify-between h-screen 
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 
                ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>

                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
                >
                    <HiX />
                </button>

                <div className="mt-6 md:mt-0">
                    <div className="hidden md:flex items-center mb-3 justify-center">
                        <h1 className="text-custom-black text-base sm:text-lg font-bold capitalize">
                            {displayTitle}
                        </h1>
                    </div>

                    <div className="flex flex-col items-center mb-5">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 mb-3 bg-primary-shadow rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <p className="text-custom-black text-lg font-semibold text-center leading-tight">
                            {user?.name ? user.name.split(" ").slice(0, 2).join(" ") : "Usuario"}
                        </p>
                        <p className="text-gray-500 text-sm font-medium text-center truncate w-full px-2 mt-1">
                            {user?.email}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {grid.map((item) => {
                            const disabled = item.path === "/unknow";
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <button
                                    key={item.id}
                                    disabled={disabled}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`
                                        flex items-center transition-all cursor-pointer rounded-xl p-2 justify-center flex-col
                                    ${isActive
                                        ? "bg-primary-shadow text-primary ring-1 ring-primary/20"
                                        : "hover:bg-gray-50 border border-transparent hover:border-gray-100 text-custom-black"
                                    }
                                    ${disabled ? "opacity-50" : ""}
                                `}
                                >
                                    <div className={`mb-2 text-3xl transition-transform ${isActive ? "text-primary scale-110" : "text-custom-black/50 group-hover:text-custom-black"}`}>
                                        {item.icon}
                                    </div>
                                    <p className="font-semibold text-xs text-center tracking-wide">{item.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t pb-[env(safe-area-inset-bottom)] border-gray-100">
                    <LogOutButton />
                </div>
            </div>

            <div className="flex-1 p-4 md:p-5 bg-gray-50 h-[calc(100dvh-64px)] md:h-[100dvh] overflow-y-auto">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default DashboardLayout;