import React, { useState, type JSX } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import LogOutButton from "./auth/LogOutButton.tsx";
import type { UserProfile } from "../auth/useAuth.ts";
import ErrorBoundary from "./core/ErrorBoundary.tsx";
import { HiMenu, HiX } from "react-icons/hi";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import logo from "../../src/assets/images/logo.png"
import { roleTranslations } from "../types";

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

const DashboardLayout = ({ user, grid }: LayoutProps) => {
    const displayTitle = roleTranslations[user?.role || ""] || "Usuario";
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMobileOpen(false);
    };

    const userInitials = user?.first_name
        ? `${user.first_name.charAt(0).toUpperCase()}${user.first_last_name.charAt(0).toUpperCase()}`
        : "UN";

    const userName = user?.first_name
        ? `${user?.first_name} ${user?.first_last_name}`
        : "Usuario";

    return (
        <div className="flex flex-col md:flex-row h-dvh overflow-hidden bg-gray-50">
            <div className="md:hidden bg-white border-b border-gray-200 p-2 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/${user?.role}/dashboard`)}>
                        <img className="w-7 h-7 object-contain" src={logo} alt="Logo" />
                    </button>
                    <h1 className="text-primary text-lg font-bold capitalize">
                        Babel
                    </h1>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="text-2xl text-custom-black hover:text-primary transition-colors focus:outline-none"
                >
                    <HiMenu />
                </button>
            </div>

            <div className={`
                fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 h-dvh 
                transition-all duration-300 ease-in-out
                
                /* Mobile: 100% width, toggled via transform */
                w-full ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                
                /* Desktop: Relative positioning, toggled via width */
                md:translate-x-0 md:relative 
                ${isExpanded ? "md:w-64" : "md:w-16"}
            `}>

                <div className={`flex items-center p-3 mb-2 ${isExpanded ? 'justify-between' : 'justify-between md:justify-center'}`}>
                    <div className={`flex items-center gap-1 overflow-hidden transition-opacity duration-200 ${isExpanded ? "opacity-100" : "md:opacity-0 md:hidden"}`}>
                        <button className="cursor-pointer shrink-0" onClick={() => navigate(`/${user?.role}/dashboard`)}>
                            <img className="w-7 h-7 object-contain" src={logo} alt="Logo" />
                        </button>
                        <h1 className="text-primary text-lg font-bold capitalize truncate">
                            Babel
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden md:flex text-gray-500 hover:text-custom-black hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
                    >
                        {isExpanded ? <LuPanelLeftClose className="size-5" /> : <LuPanelLeftOpen className="size-5" />}
                    </button>

                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <HiX />
                    </button>
                </div>

                <div className={`flex-1 overflow-y-auto flex flex-col gap-1.5 ${isExpanded ? "px-2" : "px-3"}`}>
                    {grid.map((item) => {
                        const disabled = item.path === "/unknow";
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <button
                                key={item.id}
                                disabled={disabled}
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    flex items-center gap-3 transition-all cursor-pointer rounded-xl p-2 group
                                    ${isActive
                                    ? "bg-gray-100/80 text-custom-black"
                                    : "hover:bg-gray-50 text-gray-600"
                                }
                                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    ${!isExpanded ? "md:justify-center" : "justify-start"}
                                `}
                                title={!isExpanded ? item.label : ""}
                            >
                                <div className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-gray-500 group-hover:text-custom-black"}`}>
                                    <div className="text-2xl">
                                        {item.icon}
                                    </div>
                                </div>

                                <span className={`
                                    font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden
                                    ${isExpanded ? "opacity-100 w-auto" : "md:hidden md:opacity-0 md:w-0"}
                                `}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-2">
                    <LogOutButton isExpand={isExpanded} />
                </div>

                <div className="border-t p-2 border-gray-100">
                    <div className={`flex items-center bg-white rounded-xl hover:bg-gray-50 transition-colors p-1 cursor-pointer border border-transparent hover:border-gray-100 ${isExpanded ? 'justify-between' : 'md:justify-center'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs">
                                {userInitials}
                            </div>

                            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "opacity-100 w-auto" : "md:hidden md:opacity-0 md:w-0"}`}>
                                <span className="text-sm font-semibold text-gray-900 truncate capitalize">
                                    {userName}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    {displayTitle}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 relative">
                <ErrorBoundary>
                    <div className="p-3 min-h-full">
                        <Outlet />
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default DashboardLayout;