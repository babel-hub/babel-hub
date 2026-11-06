import React from "react";
import { HiOutlineCalendar, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUsers } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import type { TabTypes } from "../../../../features/types/types";
import ButtonChevronBack from "../../../../components/ui/buttons/ButtonChevrowBack.tsx";
import { reverseName } from "../../../../types";
import { CustomSelect } from "../../../../components/ui/selector/CustomSelect.tsx";
import type {PrincipalClassData, SharedClassData, TeacherClassData} from "../../types/types.ts";
import type { Period } from "../../../global/types/types.ts";

interface SharedClassLayoutProps {
    children: React.ReactNode;
    data: SharedClassData;
    activeTab: TabTypes;
    onTabChange: (tab: TabTypes) => void;
    periods: Period[];
    periodId: string;
    onPeriodChange: (periodId: string) => void;
    showPeriodSelector: boolean;
    showCalendar: boolean;
    date: string;
    setDate: (date: string) => void;
    viewMode: "principal" | "teacher";
}

export function ClassLayout({
                                      children,
                                      data,
                                      activeTab,
                                      onTabChange,
                                      periods,
                                      periodId,
                                      onPeriodChange,
                                      showPeriodSelector,
                                      showCalendar,
                                      date,
                                      setDate,
                                      viewMode
                                  }: SharedClassLayoutProps) {
    const navigate = useNavigate();
    const isPrincipal = viewMode === "principal";

    const subjectName = isPrincipal
        ? (data as PrincipalClassData).details.subject_name
        : (data as TeacherClassData).subject_name;

    const courseName = isPrincipal
        ? (data as PrincipalClassData).details.course_name
        : (data as TeacherClassData).course_name;

    const students = data.students || [];

    const totalStudents = !isPrincipal
        ? (data as TeacherClassData).total_students
        : students.length;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50">
            <div className="sticky top-0 z-40 bg-white flex flex-col gap-4">
                <div className="flex flex-col pt-5 px-5 md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center">
                        {isPrincipal && (
                            <ButtonChevronBack onClick={() => navigate(-1)} />
                        )}
                        <div>
                            <h1 className="text-xl md:text-1xl xl:text-2xl capitalize font-bold text-custom-black">
                                {subjectName}
                                <span className="text-gray-400 font-normal ml-2">| {courseName}</span>
                            </h1>

                            {isPrincipal ? (
                                <p className="text-gray-500 mt-1 text-xs md:text-sm">
                                    Profesor: <span className="font-medium capitalize text-gray-700">
                                        {reverseName({
                                            middleName: (data as PrincipalClassData).details.teacher_middle_name,
                                            secondLastName: (data as PrincipalClassData).details.teacher_second_last_name,
                                            firstName: (data as PrincipalClassData).details.teacher_first_name,
                                            firstLastName: (data as PrincipalClassData).details.teacher_first_last_name
                                        })}
                                    </span>
                                </p>
                            ) : (
                                <p className="text-gray-500 mt-1 text-xs md:text-sm">
                                    <span className="font-medium text-gray-700">{totalStudents} Estudiantes inscritos</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {showPeriodSelector && (
                        <div className="w-full md:max-w-48 shrink-0">
                            <CustomSelect
                                options={periods.map(p => ({ value: p.id, label: p.name }))}
                                value={periodId}
                                onChange={onPeriodChange}
                                disabled={students.length === 0}
                            />
                        </div>
                    )}

                    {showCalendar && (
                        <div className="w-full md:max-w-48 shrink-0">
                            <input
                                type="date"
                                disabled={students.length === 0}
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
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'students' ? 'text-primary-darker border-b-primary-darker border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineUsers className="text-lg" /> {isPrincipal ? "Agenda" : "Estudiantes"}
                    </button>
                    <button
                        onClick={() => onTabChange('register attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'register attendance' ? 'text-primary-darker border-b-primary-darker border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineClipboardList className="text-lg" /> Tomar Asistencia
                    </button>
                    <button
                        onClick={() => onTabChange('see attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'see attendance' ? 'text-primary-darker border-b-primary-darker border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineCalendar className="text-lg" /> Ver Asistencia
                    </button>
                    <button
                        onClick={() => onTabChange('assignments')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'assignments' ? 'text-primary-darker border-b-primary-darker border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineDocumentText className="text-lg" /> Calificaciones
                    </button>
                </div>
            </div>

            <div className="flex-1 styled-scrollbar overflow-y-auto">
                {children}
            </div>
        </div>
    );
}