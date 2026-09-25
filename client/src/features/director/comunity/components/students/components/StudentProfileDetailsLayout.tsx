import React from "react";
import { LuSearch, LuSettings, LuGraduationCap, LuShield } from "react-icons/lu";
import type { StudentProfileTabTypes } from "../../../../../../types";
import {LoadingContent} from "../../../../../../components/ui/Loadings.tsx";

interface StudentProfileDetailsLayoutProps {
    studentId: string;
    onClose: () => void;
    children: React.ReactNode;
    onTabChange: (tab: StudentProfileTabTypes) => void;
    activeTab: StudentProfileTabTypes;
    loading: boolean;
}

export function StudentProfileDetailsLayout({ onClose, children, onTabChange, activeTab, loading }: StudentProfileDetailsLayoutProps) {

    const getTabClass = (tabName: StudentProfileTabTypes) => {
        return `flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tabName
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 md:p-8 lg:p-12">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col border-r border-gray-200 bg-gray-50/50 w-full md:w-52 shrink-0">
                    <div className="p-4 hidden md:block border-b border-gray-100">
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                            />
                        </div>
                    </div>

                    <div className="p-3 flex md:flex-col gap-1 overflow-y-auto no-scrollbar">
                        <span className="text-[11px] hidden md:block font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1 mt-2">
                            Configuración
                        </span>

                        <button onClick={() => onTabChange('general')} className={getTabClass('general')}>
                            <LuSettings className="size-4" /> General
                        </button>

                        <button onClick={() => onTabChange('security')} className={getTabClass('security')}>
                            <LuShield className="size-4" /> Privacidad
                        </button>

                        <span className="text-[11px] hidden md:block font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1 mt-4">
                            Estudiante
                        </span>

                        <button onClick={() => onTabChange('academic')} className={getTabClass('academic')}>
                            <LuGraduationCap className="size-4" /> Área Académica
                        </button>
                    </div>
                </div>

                <div className="flex flex-col flex-1 relative bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg p-1.5 transition-colors z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {
                        loading ? (
                            <LoadingContent title="" />
                        ) : (
                            <div className="flex-1 overflow-y-auto p-8 lg:px-12 styled-scrollbar">
                                {children}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}