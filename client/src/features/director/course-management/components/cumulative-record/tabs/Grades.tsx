import { useCumulativeGrades } from "../../../hooks/cumulative-records/useCumulativeGrades.ts";
import { LoadingContent } from "../../../../../../components/ui/Loadings.tsx";
import {reverseName} from "../../../../../../types";

interface GradesProps {
    courseId: string;
    periodId: string;
}

export function Grades({ courseId, periodId }: GradesProps) {
    const { grades, loading } = useCumulativeGrades(courseId, periodId);

    if (loading) return <LoadingContent title="" />;

    if (!grades || grades.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500">
                No hay calificaciones registradas para este curso en este periodo.
            </div>
        );
    }

    const subjectHeaders = grades[0]?.subjects?.map(s => s.subject_name) || [];

    console.log(grades[0]);

    return (
        <div className="px-4 pb-2">
            <div className="relative min-w-md overflow-x-auto no-scrollbar md:rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th scope="col" className="p-3 sticky left-0 bg-gray-100 z-20 min-w-3xs">
                            Estudiante
                        </th>

                        {subjectHeaders.map((subjectName, index) => (
                            <th key={index} scope="col" className="py-3 px-2 capitalize text-center">
                                {subjectName.slice(0, 3)}
                            </th>
                        ))}

                        <th scope="col" className="py-3 px-2 text-center bg-primary-darker text-white font-bold sticky right-0 z-20">
                            Promedio
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {grades.map((student, index) => {
                        const fullName = reverseName({
                            middleName: student.student_middle_name,
                            firstName: student.student_first_name,
                            firstLastName: student.student_first_last_name,
                            secondLastName: student.student_second_last_name
                        })

                        return (
                            <tr
                                key={student.student_id}
                                className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === grades.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <th scope="row" className="px-2 py-3 font-semibold text-custom-black whitespace-nowrap sticky left-0 z-10 bg-inherit capitalize">
                                    {fullName}
                                </th>

                                {(student.subjects ?? []).map((subject) => (
                                    <td key={subject.class_id} className="px-2 py-3 text-center">
                                        {
                                            subject.final_grade > 0 ? (
                                                <span className="text-gray-700">
                                                    {subject.final_grade.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span>-</span>
                                            )
                                        }
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center font-bold text-primary border-l border-gray-200 bg-white sticky right-0 z-10 shadow-[-1px_0_0_0_#e5e7eb]">
                                    {student.period_average}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}