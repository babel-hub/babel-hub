import type { StudentProps } from "../../types";
import { StudentsRows } from "../ui/StudentRows.tsx";

interface StudentsTableProps {
    students: StudentProps[];
}

export function StudentsTable({ students }: StudentsTableProps) {
    return (
        <div className="bg-white md:rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <th className="p-4 text-sm font-semibold">Estudiantes ({students.length})</th>
                    <th className="p-4 text-sm font-semibold">Código</th>
                    <th className="p-4 text-sm font-semibold">Curso</th>
                    <th className="p-4 text-sm font-semibold">Fecha de Registro</th>
                    <th className="p-4 text-sm font-semibold text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                    <StudentsRows
                        key={student.student_id}
                        student={student}
                    />
                ))}
                </tbody>
            </table>
        </div>
    )
}