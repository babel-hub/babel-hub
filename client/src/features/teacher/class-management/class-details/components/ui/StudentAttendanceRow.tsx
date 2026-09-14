import { memo } from "react";
import { reverseName } from "../../../../../../types";
import type { AttendanceStatus, Student } from "../../../../../types/types.ts";
import {BsClock} from "react-icons/bs";
import {CgDanger} from "react-icons/cg";
import {IoDocumentTextOutline} from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";

export const StudentAttendanceRow = memo(function StudentAttendanceRow({
                                                                    student,
                                                                    status,
                                                                    onUpdateStatus
                                                                }: {
    student: Student;
    status: string;
    onUpdateStatus: (id: string, status: AttendanceStatus) => void
}) {
    return (
        <li className="sm:p-3 p-2 md:p-4 bg-white flex flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full uppercase bg-primary-shadow text-primary hidden sm:flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                    {`${student.first_name.charAt(0)}${student.first_last_name.charAt(0)}`}
                </div>
                <span className="font-medium text-sm md:text-base capitalize text-custom-black leading-tight">
                    {
                        reverseName({
                            firstLastName: student.first_last_name,
                            firstName:student.first_name,
                            middleName: student.middle_name,
                            secondLastName: student.second_last_name

                        })
                    }
                </span>
            </div>

            <div className="flex p-1 shrink-0">
                <button
                    onClick={() => onUpdateStatus(student.student_id, 'present')}
                    className={`sm:px-2 p-1 sm:py-1.5 rounded-md transition-all`}
                >
                    <span className={`border-1 p-1 text-xs rounded-full block ${status === 'present' ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent text-gray-700 border-gray-400'}`}><IoMdCheckmark /></span>
                </button>
                <button
                    onClick={() => onUpdateStatus(student.student_id, 'late')}
                    className={`sm:px-2 p-1 sm:py-1.5 rounded-md transition-all`}
                >
                    <span className={`border-1 p-1 text-xs rounded-full block ${status === 'late' ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-transparent text-gray-700 border-gray-400'}`}><BsClock /></span>
                </button>
                <button
                    onClick={() => onUpdateStatus(student.student_id, 'absent')}
                    className={`sm:px-2 p-1 sm:py-1.5 rounded-md transition-all`}
                >
                    <span className={`border-1 p-1 text-xs rounded-full block ${status === 'absent' ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent text-gray-700 border-gray-400'}`}><CgDanger /></span>
                </button>
                <button
                    onClick={() => onUpdateStatus(student.student_id, 'excused')}
                    className={`sm:px-2 p-1 sm:py-1.5 rounded-md transition-all`}
                >
                    <span className={`border-1 p-1 text-xs rounded-full block ${status === 'excused' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-transparent text-gray-700 border-gray-400'}`}><IoDocumentTextOutline /></span>
                </button>
            </div>
        </li>
    );
});