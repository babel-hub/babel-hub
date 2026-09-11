import ButtonChevronBack from "../../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { reverseName } from "../../../../../types";
import { HiOutlineCalendar, HiOutlineClipboardList } from "react-icons/hi";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LuClipboardPenLine } from "react-icons/lu";
import type { CumulativeGPATypes, ParentStudent } from "../../../shared/types/types.ts";

interface CumulativeGPALayoutProps {
    children: React.ReactNode;
    student: ParentStudent[];
    activeTab: CumulativeGPATypes;
    onButtonChange: (tab: CumulativeGPATypes) => void;
    periods: any[];
    selectedPeriodId: string;
    onPeriodChange: (id: string) => void;
}

export function CumulativeGPALayout({
                                        children,
                                        student,
                                        activeTab,
                                        onButtonChange,
                                        periods,
                                        selectedPeriodId,
                                        onPeriodChange
                                    }: CumulativeGPALayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col shadow-xs md:rounded-xl h-[calc(100dvh-5rem)] md:h-[calc(100dvh-1.8rem)] w-full bg-gray-50">
            <div className="sticky top-0 z-10 p-3 bg-white md:rounded-t-xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex gap-4 items-center">
                            <ButtonChevronBack onClick={() => navigate(-1)} />
                            <div>
                                <h1 className="text-xl md:text-1xl xl:text-2xl capitalize font-bold text-custom-black">
                                    Acumulado
                                </h1>
                                <p className="text-gray-500 mt-1 text-xs md:text-sm">
                                    Estudiante: <span className="font-medium capitalize text-gray-700">
                                        {
                                            reverseName({
                                                middleName: student[0].student_middle_name,
                                                secondLastName: student[0].student_second_last_name,
                                                firstName: student[0].student_first_name,
                                                firstLastName: student[0].student_first_last_name
                                            })
                                        } - {student[0].course_name}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className={`self-end sm:self-auto ${activeTab === 'attendance' ? 'hidden' : ''}`}>
                            <select
                                className="bg-white text-sm capitalize appearance-none text-custom-black border border-gray-200 rounded-xl md:px-4 p-2 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                                value={selectedPeriodId}
                                disabled={activeTab === 'attendance'}
                                onChange={(e) => onPeriodChange(e.target.value)}
                            >
                                {periods?.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex w-full sm:w-1/2 items-center gap-1 rounded-xl bg-gray-50 p-1">
                    <button
                        onClick={() => onButtonChange('attendance')}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200 cursor-pointer ${
                            activeTab === 'attendance'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <LuClipboardPenLine className="size-4" />
                        Asistencia
                    </button>

                    <button
                        onClick={() => onButtonChange('grades')}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200 cursor-pointer ${
                            activeTab === 'grades'
                                ? 'bg-primary text-white '
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <HiOutlineClipboardList className="size-4" />
                        Calificaciones
                    </button>

                    <button
                        onClick={() => onButtonChange('observations')}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200 cursor-pointer ${
                            activeTab === 'observations'
                                ? 'bg-primary text-white '
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <HiOutlineCalendar className="size-4" />
                        Observaciones
                    </button>

                </div>

            </div>
            <div className="overflow-auto no-scrollbar">
                {children}
            </div>
        </div>
    )
}