import { Fragment, useEffect, useRef, useState } from "react";
import { reverseName } from "../../../../../types";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import type { AttendanceSummary } from "../../types";
import StudentCalendarCardComponent from "./StudentCalendarCard.tsx";
import { CgDanger } from "react-icons/cg";
import { GoClock } from "react-icons/go";
import type { Period } from "../../../../../shared/types/types.ts";

interface AttendanceListProps {
    attendance: AttendanceSummary[];
    uniqueCourses: string[];
    period: Period;
}

export function AttendanceList({ attendance, uniqueCourses, period }: AttendanceListProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [openStudentId, setOpenStudentId] = useState<string | null>(null);

    useEffect(() => {
        const calendarRef = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpenStudentId(null);
            }
        };

        document.addEventListener("mousedown", calendarRef);
        return () => document.removeEventListener("mousedown", calendarRef);
    }, []);

    const handleToggle = (student: AttendanceSummary) => {
        if (student.student_id) {
            setOpenStudentId(prev => prev === student.student_id ? null : student.student_id);
        }
    };

    return (
        <div ref={ref} className="flex flex-col w-full gap-10">
            {
                attendance.length > 0 ? (
                    uniqueCourses.map((course) => {
                        const courseStudents = attendance.filter(
                            student => student.course_name === course
                        );

                        return (
                            <div key={course}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2 items-center w-full rounded-xl bg-primary-shadow p-2">
                                        <div className="px-1.5 py-2 rounded-xl bg-primary-darker">
                                            <p className="text-white text-sm font-bold">{course}</p>
                                        </div>
                                        <div className="flex flex-col justify-start">
                                            <p className="text-custom-black md:text-base text-sm font-semibold">Curso {course}</p>
                                            <p className="text-primary-darker text-xs">estudiantes</p>
                                        </div>
                                    </div>

                                    {courseStudents.map((student) => {
                                        const absences = Number(student.total_absences);
                                        const lates = Number(student.total_lates);
                                        const isOpen = openStudentId === student.student_id;
                                        const isRedAlert = student.is_red_alert;

                                        return (
                                            <Fragment key={student.student_id}>
                                                <button
                                                    onClick={() => handleToggle(student)}
                                                    className={`group py-3 px-4 cursor-pointer transition-all duration-200 w-full border flex items-center justify-between rounded-xl
                                                    ${isOpen ?
                                                        isRedAlert ? 'border-red-error shadow-md' : 'border-primary' :
                                                        isRedAlert ? 'border-red-error hover:shadow-sm' : 'border-gray-100 bg-white hover:border-primary-shadow hover:bg-primary-shadow/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center min-w-0 gap-3">
                                                        <div className={`w-8 h-8 rounded-full uppercase flex items-center justify-center text-xs font-bold transition-colors
                                                                ${isOpen ?
                                                            isRedAlert ? 'bg-red-error text-white' : 'bg-primary text-white' :
                                                            isRedAlert ? 'bg-red-shadow text-red-error' : 'bg-primary-shadow text-primary'
                                                        }`}>
                                                            {`${student.student_first_name.charAt(0)}${student.student_first_last_name.charAt(0)}`}
                                                        </div>
                                                        <p className={`text-sm md:text-base leading-tight max-w-40 sm:max-w-full text-left capitalize font-semibold transition-colors 
                                                                ${isOpen ?
                                                            'text-gray-900' :
                                                            isRedAlert ? 'text-gray-700 group-hover:text-red-error' : 'text-custom-black'
                                                        }`}>
                                                            {
                                                                reverseName({
                                                                    middleName: student.student_middle_name,
                                                                    secondLastName: student.student_second_last_name,
                                                                    firstName: student.student_first_name,
                                                                    firstLastName: student.student_first_last_name
                                                                })
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className={`text-sm flex gap-1 items-center font-bold px-2 py-1 rounded-md ${lates > 0 ? 'bg-yellow-50 text-yellow-600' : 'text-gray-300'}`}>
                                                            <span><GoClock /></span>
                                                            <p>{lates}</p>
                                                        </div>

                                                        <div className={`text-sm flex gap-1 items-center font-bold px-2 py-1 rounded-md ${
                                                            absences > 0 ? 'bg-red-50 text-red-500' : 'text-gray-300'
                                                        }`}>
                                                            <span><CgDanger /></span>
                                                            <p>{absences}</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {isOpen && period && (
                                                    <div className="p-1 rounded-xl border border-gray-100">
                                                        <div className="bg-white rounded-xl shadow-inner">
                                                            <StudentCalendarCardComponent
                                                                studentId={student.student_id}
                                                                period={period}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <NoResults title="No hay alertas de asistencia para hoy"/>
                )
            }
        </div>
    )
}