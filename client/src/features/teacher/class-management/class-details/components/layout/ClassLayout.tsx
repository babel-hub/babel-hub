import React from "react";
import { HiOutlineCalendar, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUsers } from "react-icons/hi";
import type { ClassDetailsData } from "../../types";
import type { TabTypes } from "../../../../../types/types.ts";
import type {Period} from "../../../../../../shared/types/types.ts";
import { CustomSelect } from "../../../../../../components/ui/selector/CustomSelect.tsx";

interface ClassLayoutProps {
    children: React.ReactNode;
    classDetails: ClassDetailsData;
    activeTab: TabTypes;
    onTabChange: (tab: TabTypes) => void;
    periods: Period[];
    periodId: string;
    onPeriodChange: (periodId: string) => void;
    showPeriodSelector: boolean;
    showCalendar: boolean;
    date: string;
    setDate: (date: string) => void;
}

export function ClassLayout ({ children, onTabChange, classDetails, activeTab, onPeriodChange, periods, periodId, setDate, date, showPeriodSelector, showCalendar }: ClassLayoutProps) {
    return (
        <div className="flex flex-col h-full w-full ">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col pt-5 px-5 md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center">
                        <div>
                            <h1 className="text-xl md:text-1xl xl:text-2xl capitalize font-bold text-custom-black">
                                {classDetails.subject_name}
                                <span className="text-gray-400 font-normal ml-2">| {classDetails.course_name}</span>
                            </h1>
                            <p className="text-gray-500 mt-1 text-xs md:text-sm">
                                <span className="font-medium text-gray-700">{classDetails.total_students} Estudiantes inscritos</span>
                            </p>
                        </div>
                    </div>

                    {showPeriodSelector && (
                        <div className="w-full md:max-w-48 shrink-0">
                            <CustomSelect
                                options={periods.map(p => ({ value: p.id, label: p.name }))}
                                value={periodId}
                                onChange={onPeriodChange}
                                disabled={classDetails.students.length === 0}
                            />
                        </div>
                    )}

                    {showCalendar && (
                        <div className="w-full md:max-w-48 shrink-0">
                            <input
                                type="date"
                                disabled={classDetails.students.length === 0}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-gray-50 w-full text-sm border border-gray-200 text-gray-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            />
                        </div>
                    )}
                </div>

                <div className="flex overflow-x-auto bg-white w-full no-scrollbar">
                    <button
                        onClick={() => onTabChange('students')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'students' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineUsers className="text-lg" /> Estudiantes
                    </button>
                    <button
                        onClick={() => onTabChange('register attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'register attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineClipboardList className="text-lg" /> Tomar Asistencia
                    </button>
                    <button
                        onClick={() => onTabChange('see attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'see attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineCalendar className="text-lg" /> Ver Asistencia
                    </button>
                    <button
                        onClick={() => onTabChange('assignments')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'assignments' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineDocumentText className="text-lg" /> Calificaciones
                    </button>
                </div>
            </div>

            <div className="flex-1 styled-scrollbar overflow-y-auto">
                {children}
            </div>
        </div>
    )
}