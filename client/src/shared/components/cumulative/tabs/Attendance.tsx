import { useCumulativeAttendance } from "../../../hooks/cumulative/useCumulativeAttendance.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { AttendanceDonut } from "../ui/AttendanceDonut.tsx";

interface AttendanceProps {
    courseId: string;
    periodId: string;
}

export function Attendance({ courseId, periodId }: AttendanceProps) {
    const { attendance, loading, error } = useCumulativeAttendance(courseId, periodId);

    if (loading) return <LoadingContent title="" />;
    if (error) return <NoResults title={error} />;
    if (!attendance || attendance.length === 0) {
        return <NoResults title="No hay datos de asistencia registrados para este curso en este periodo" />;
    }

    const totals = attendance.reduce(
        (acc, s) => ({
            present: acc.present + s.present,
            absent:  acc.absent  + s.absent,
            late:    acc.late    + s.late,
            excused: acc.excused + s.excused,
        }),
        { present: 0, absent: 0, late: 0, excused: 0 }
    );

    return (
        <div className="grid grid-cols-5 items-start gap-3 px-4">
            <div className="relative col-span-3 max-w-2xl max-h-[calc(100dvh-14.3rem)] overflow-x-auto no-scrollbar md:rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="p-2 sticky left-0 bg-gray-100 z-20 min-w-3xs">
                                Estudiante
                            </th>
                            <th scope="col" className="p-2 text-center">Asistió</th>
                            <th scope="col" className="p-2 text-center">Inasistencia</th>
                            <th scope="col" className="p-2 text-center">Retardo</th>
                            <th scope="col" className="p-2 text-center">Justificada</th>
                            <th scope="col" className="p-2 min-w-36 text-center">Tasa de Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                    {attendance.map((student, index) => {
                        const fullName = reverseName({
                            middleName: student.student_middle_name,
                            firstName: student.student_first_name,
                            firstLastName: student.student_first_last_name,
                            secondLastName: student.student_second_last_name
                        });

                        const total = student.present + student.absent + student.late + student.excused;
                        const rate = total > 0 ? Math.round((student.present / total) * 100) : 0;

                        const attColor =
                            rate >= 90 ? "text-green-700 bg-green-50"
                                : rate >= 80 ? "text-yellow-700 bg-yellow-50"
                                    : "text-red-700 bg-red-50";

                        return (
                            <tr
                                key={student.student_id}
                                className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === attendance.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <th scope="row" className="px-2 py-3 font-semibold min-w-3xs text-custom-black whitespace-nowrap sticky left-0 bg-inherit capitalize">
                                    {fullName}
                                </th>
                                <td className="py-3 text-center font-medium text-green-600">{student.present}</td>
                                <td className="py-3 text-center font-medium">
                                    <span className={student.absent > 3 ? "text-red-500" : "text-gray-600"}>
                                        {student.absent}
                                    </span>
                                </td>
                                <td className="py-3 text-center font-medium text-yellow-600">{student.late}</td>
                                <td className="py-3 text-center font-medium text-sky-500">{student.excused}</td>
                                <td className="py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold ${attColor}`}>
                                        {rate}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div className="w-full col-span-2 border border-gray-200 rounded-xl p-3 h-[230px] flex flex-col">
                <h3 className="text-sm font-semibold shrink-0">Distribución de asistencia</h3>
                <div className="flex-1 min-h-0 mt-2">
                    <AttendanceDonut totals={totals} />
                </div>
            </div>
        </div>
    );
}