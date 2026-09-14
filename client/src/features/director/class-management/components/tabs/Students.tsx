import { reverseName } from "../../../../../types";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import type { Student } from "../../../../types/types.ts";

interface StudentsProps {
    students: Student[];
}

export function Students({ students }: StudentsProps) {
    return (
        <div className="bg-white overflow-hidden">
            {
                students.length > 0 ? (
                    <ul className="divide-y divide-gray-50">
                        {
                            students.map((student) => (
                                <li key={student.student_id} className="py-3 px-5 flex items-center gap-4 hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full uppercase bg-primary-shadow text-primary-darker flex items-center justify-center text-sm font-bold shrink-0">
                                        {`${student.first_name.charAt(0)}${student.first_last_name.charAt(0)}`}
                                    </div>
                                    <div>
                                        <span className="block text-sm md:text-base capitalize font-medium text-custom-black">
                                            {
                                                reverseName({
                                                    firstName: student.first_name,
                                                    middleName: student.middle_name,
                                                    firstLastName: student.first_last_name,
                                                    secondLastName: student.second_last_name
                                                })
                                            }
                                        </span>
                                        <span className="block text-sm text-gray-500">{student.email}</span>
                                    </div>
                                </li>
                            ))}
                    </ul>
                ) : (<NoResults title="No hay estudiantes en este curso" />)
            }
        </div>
    );
}