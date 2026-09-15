import React from "react";
import {LuClipboardCheck } from "react-icons/lu";

import { reverseName } from "../../../../../types";
import type { CumulativeGPATypes, ParentStudent } from "../../../shared/types/types.ts";
import {TbCalendarFilled} from "react-icons/tb";
import {BiCommentDetail} from "react-icons/bi";

interface CumulativeGPALayoutProps {
    children: React.ReactNode;
    students: ParentStudent[];
    activeStudent?: ParentStudent;
    onStudentChange: (studentId: string) => void;
    activeTab: CumulativeGPATypes;
    onButtonChange: (tab: CumulativeGPATypes) => void;
    periods: any[];
    selectedPeriodId: string;
    onPeriodChange: (id: string) => void;
}

export function CumulativeGPALayout({
                                        children,
                                        students,
                                        activeStudent,
                                        onStudentChange,
                                        activeTab,
                                        onButtonChange,
                                        periods,
                                        selectedPeriodId,
                                        onPeriodChange
                                    }: CumulativeGPALayoutProps) {
    const formatStudentName = (s: ParentStudent) => reverseName({
        middleName: s.student_middle_name,
        secondLastName: s.student_second_last_name,
        firstName: s.student_first_name,
        firstLastName: s.student_first_last_name
    });

    return (
        <div className="flex flex-col shadow-xs gap-3 md:rounded-xl h-[calc(100dvh-5rem)] md:h-[calc(100dvh-1.8rem)] w-full bg-gray-50">
            <div className="sticky top-0 z-10 p-3 bg-white md:rounded-t-xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex gap-4 items-center">
                            <div>
                                <h1 className="text-xl md:text-1xl xl:text-2xl capitalize font-bold text-custom-black">
                                    Acumulado
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-500 text-xs md:text-sm">Estudiante:</span>

                                    {students.length > 1 ? (
                                        <select
                                            className="bg-gray-50 text-xs md:text-sm capitalize border border-gray-200 text-custom-black rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                                            value={activeStudent?.student_id || ""}
                                            onChange={(e) => onStudentChange(e.target.value)}
                                        >
                                            {students.map(s => (
                                                <option key={s.student_id} value={s.student_id}>
                                                    {formatStudentName(s)} - {s.course_name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="font-medium capitalize text-xs md:text-sm text-gray-700">
                                            {activeStudent ? `${formatStudentName(activeStudent)} - ${activeStudent.course_name}` : 'Cargando...'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`self-end sm:self-auto ${activeTab === 'attendance' ? 'hidden' : ''}`}>
                            <select
                                className="bg-white text-xs md:text-sm capitalize appearance-none text-custom-black border border-gray-200 rounded-xl md:px-4 p-2 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
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

                <div className="flex order-1 items-center w-full sm:max-w-xs md:max-w-lg rounded-full gap-1 bg-gray-50">
                    <button
                        onClick={() => onButtonChange('attendance')}
                        disabled={true}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                            activeTab === 'attendance'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <TbCalendarFilled className="size-[18px]" />
                        <span className="hidden lg:block">Asistencia</span>
                    </button>

                    <button
                        onClick={() => onButtonChange('grades')}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                            activeTab === 'grades'
                                ? 'bg-primary text-white '
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <LuClipboardCheck className="size-4" />
                        <span className="hidden lg:block">Calificaciones</span>
                    </button>

                    <button
                        onClick={() => onButtonChange('observations')}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                            activeTab === 'observations'
                                ? 'bg-primary text-white '
                                : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100/60'
                        }`}
                    >
                        <BiCommentDetail className="size-4" />
                        <span className="hidden lg:block">Observaciones</span>
                    </button>
                </div>
            </div>

            <div className="overflow-auto no-scrollbar">
                {children}
            </div>
        </div>
    )
}