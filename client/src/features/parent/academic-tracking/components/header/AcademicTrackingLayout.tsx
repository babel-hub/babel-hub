import { reverseName } from "../../../../../types";
import { LuClipboardCheck } from "react-icons/lu";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import React from "react";
import type { CumulativeGPATypes, ParentStudent } from "../../../shared/types/types.ts";
import { isToday, shiftDay } from "../../utils/utils.ts";
import { formatDayLabel } from "../../../../utils/utils.ts";
import {BiCommentDetail} from "react-icons/bi";
import { TbCalendarFilled } from "react-icons/tb";

interface AcademicTrackingLayoutProps {
    children: React.ReactNode;
    student: ParentStudent[];
    activeTab: CumulativeGPATypes;
    onButtonTabChange: (tab: CumulativeGPATypes) => void;
    date: string;
    onButtonDateChange: (date: string) => void;
}

export function AcademicTrackingLayout({ children, student, activeTab, onButtonTabChange, date, onButtonDateChange } : AcademicTrackingLayoutProps) {
    return (
        <div className="flex flex-col md:rounded-xl h-[calc(100dvh-5rem)] md:h-[calc(100dvh-1.8rem)] w-full bg-gray-50">
            <div className="sticky top-0 z-10 p-3 lg:p-4 bg-white md:rounded-xl border border-gray-100  flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex gap-4 items-center">
                            <div>
                                <h1 className="text-sm font-semibold text-primary-darker">
                                    Seguimiento Academico
                                </h1>
                                <div className="w-full">
                                    <p className="text-custom-black font-bold capitalize text-xl md:text-2xl">
                                        {
                                            reverseName({
                                                middleName: student[0].student_middle_name,
                                                secondLastName: student[0].student_second_last_name,
                                                firstName: student[0].student_first_name,
                                                firstLastName: student[0].student_first_last_name
                                            })
                                        }
                                    </p>
                                    <div className="flex items-center w-full gap-2">
                                        <p className="text-custom-black text-xs md:text-sm ">Estudiante - {student[0].course_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row justify-between items-center">
                    <div className="flex order-1 items-center w-full sm:max-w-xs md:max-w-lg rounded-full gap-1 bg-gray-50">
                        <button
                            onClick={() => onButtonTabChange('attendance')}
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
                            onClick={() => onButtonTabChange('grades')}
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
                            onClick={() => onButtonTabChange('observations')}
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
                    <div className="flex items-center md:order-2 gap-1 text-gray-500 text-sm">
                        <button
                            onClick={() => onButtonDateChange(shiftDay(date, -1))}
                            className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            aria-label="Día anterior"
                        >
                            <HiChevronLeft className="size-4" />
                        </button>
                        <span>{formatDayLabel(date)}</span>
                        <button
                            onClick={() => onButtonDateChange(shiftDay(date, 1))}
                            disabled={isToday(date)}
                            className="p-1 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Día siguiente"
                        >
                            <HiChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-auto mt-3 md:rounded-xl no-scrollbar">
                {children}
            </div>
        </div>
    )
}