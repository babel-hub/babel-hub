import { reverseName } from "../../../../../../types";
import { NoResults } from "../../../../../../components/ui/blocks/NoResults.tsx";
import {useAssignmentOverview} from "../../hooks/assignments/useAssignmentOverview.ts";
import type { Student } from "../../../../../types/types.ts";
import {finalGradeForStudent, toneBgandText} from "../../../../../../utils/utils.ts";
import {LoadingContent} from "../../../../../../components/ui/Loadings.tsx";

interface StudentsProps {
    students: Student[]
    courseId: string;
    classId: string;
    periodId: string;
}

export function Students({ students, courseId, classId, periodId }: StudentsProps) {
    const { assignmentsOverview, scale, loading } = useAssignmentOverview(
        courseId,
        classId,
        periodId,
        students.length
    );

    if (loading || !assignmentsOverview) {
        return <LoadingContent title="" />;
    }

    return (
        <div className="bg-white overflow-hidden ">
            <div className="overflow-x-auto">
                { students.length === 0 ? ( <NoResults title="No hay estudiantes en este curso." /> ) : (
                    <table className="w-full min-w-md text-center border-collapse">
                        <thead>
                            <tr className="bg-primary-shadow text-primary-darker ">
                                <th className="p-3 text-sm text-left font-medium ">Estudiante</th>
                                <th className="p-3 text-sm font-medium ">Promedio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {students.map((student) => {
                            const finalGrade = finalGradeForStudent(assignmentsOverview, student.student_id);

                            return (
                                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-3">
                                        <div className="flex items-center text-left gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary-shadow uppercase text-primary-darker flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                                                {`${student.first_name.charAt(0)}${student.first_last_name.charAt(0)}`}
                                            </div>
                                            <div>
                                                <p className="font-medium truncate capitalize text-custom-black text-sm md:text-base leading-normal">
                                                    {
                                                        reverseName({
                                                            middleName: student.middle_name,
                                                            secondLastName: student.second_last_name,
                                                            firstName: student.first_name,
                                                            firstLastName: student.first_last_name,
                                                        })
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3 text-center px-6">
                                        {
                                            (finalGrade ?? 0) > 0 ? (
                                                <span className={`text-xs md:text-sm lg:text-base p-2 rounded-xl font-medium text-gray-700 ${toneBgandText(finalGrade, {
                                                    max: scale?.max_value ?? 0,
                                                    min: scale?.min_value ?? 0,
                                                    passing: scale?.passing_value ?? 0
                                                })}`}>{finalGrade}</span>
                                            ) : (
                                                <span className={`text-xs md:text-sm lg:text-base font-medium text-gray-700}`}>-</span>
                                            )
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                ) }
            </div>
        </div>
    )
}