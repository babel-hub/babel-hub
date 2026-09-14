import { reverseName } from "../../../../../types";
import type { Student } from "../../types";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import {getStatusDotColor} from "../../../../utils/utils.ts";

interface StudentsTableProps {
    students: Student[];
    attendance: Record<string, string>;
}

export function CourseDetailsStudentsTable({ students, attendance }: StudentsTableProps) {
    return (
        <div className="p-5 overflow-y-auto styled-scrollbar">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-md text-center border-collapse">
                        <thead>
                        <tr className="bg-primary-shadow text-primary border-b border-primary-shadow">
                            <th className="py-3 md:py-4 px-4 md:px-5 lg:px-6 text-sm text-left font-semibold ">Estudiante</th>
                            <th className="py-3 md:py-4 px-4 md:px-5 lg:px-6 text-sm font-semibold ">Promedio</th>
                            <th className="py-3 md:py-4 px-4 md:px-5 lg:px-6 text-sm font-semibold ">Asistencia</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const status = attendance[student.student_id] || 'present';

                            return (
                                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-6">
                                        <div className="flex items-center text-left gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary-shadow uppercase text-primary-darker flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                                                {`${student.first_name.charAt(0)}${student.first_last_name.charAt(0)}`}
                                            </div>
                                            <div className="max-w-xs py-0.5">
                                                    <span className="block font-medium capitalize truncate text-custom-black text-sm md:text-base leading-normal">
                                                        {reverseName({
                                                            middleName: student.middle_name,
                                                            secondLastName: student.second_last_name,
                                                            firstName: student.first_name,
                                                            firstLastName: student.first_last_name
                                                        })}
                                                    </span>
                                                <span className="text-xs text-gray-400 block truncate">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3 text-center px-6">
                                        <span className="text-xs md:text-sm font-medium text-gray-700">—</span>
                                    </td>

                                    <td className="py-3 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`md:w-4 w-3 h-3 md:h-4 rounded-full ${getStatusDotColor(status)}`}></span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {students.length === 0 && ( <NoResults title="No hay estudiantes en este curso" /> )}
                </div>
            </div>
        </div>
    )
}