import type { CoursePeriodTrend, CumulativeSummary } from "../../../types/types.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { useScales } from "../../../hooks/useScales.ts";
import { AttendanceDonut } from "../ui/AttendanceDonut.tsx";
import { CourseTrendChart } from "../ui/CourseTrendChart.tsx";
import { GradeDonut } from "../ui/GradeDonut.tsx";

interface SummaryProps {
    summary: CumulativeSummary[];
    trend: CoursePeriodTrend[];
    loading: boolean;
    loadingTrend?: boolean;
}

export function Summary({ summary, loading, loadingTrend, trend }: SummaryProps) {
    const { scales, loading: loadingScales } = useScales();

    if (loading || loadingScales || loadingTrend) return <LoadingContent title="" />;
    if (!summary || summary.length === 0) {
        return (
            <div className="px-4">
                <NoResults title="No hay datos registrados para este curso en este periodo" />
            </div>
        );
    }

    const totals = summary.reduce(
        (acc, s) => ({
            present: acc.present + s.attendance.present,
            absent:  acc.absent  + s.attendance.absent,
            late:    acc.late    + s.attendance.late,
            excused: acc.excused + s.attendance.excused,
        }),
        { present: 0, absent: 0, late: 0, excused: 0 }
    );

    const scalesById = new Map(scales?.map(s => [s.id, s]) ?? []);

    return (
        <div className="px-4 pb-4">
            <div className="mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">Resumen General del Curso</h2>
                <p className="text-sm text-gray-500">Consulta el promedio del curso, la tasa de asistencia y la tendencia de rendimiento a lo largo de los periodos.</p>
            </div>

            <div className="grid grid-cols-5 gap-3">
                <div className="relative overflow-x-auto no-scrollbar col-span-3 md:rounded-xl border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="p-2 sticky left-0 bg-gray-100 z-10 min-w-3xs">
                                Estudiante
                            </th>
                            <th scope="col" className="p-2 min-w-[120px] text-center">
                                Promedio
                            </th>
                            <th scope="col" className="p-2 min-w-[140px] text-center">
                                Tasa de Asistencia
                            </th>
                            <th scope="col" className="p-2 text-center">
                                I
                            </th>
                            <th scope="col" className="p-2 text-center">
                                R
                            </th>
                            <th scope="col" className="p-2 text-center">
                                E
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {summary.map((student, index) => {
                            const fullName = reverseName({
                                middleName: student.student_middle_name,
                                firstName: student.student_first_name,
                                firstLastName: student.student_first_last_name,
                                secondLastName: student.student_second_last_name
                            });

                            const scale = student.scale_id
                                ? scalesById.get(student.scale_id)
                                : undefined;

                            const avg = student.period_average;
                            const passing = scale?.passing_value;
                            const max = scale?.max_value;

                            const isOutOfRange =
                                avg != null && max != null && avg > max;

                            const isFailing =
                                avg != null && avg > 0 && passing != null && avg < passing;

                            const attRate = student.attendance_rate ?? 0;
                            const attColor =
                                attRate >= 90 ? "text-green-700"
                                    : attRate >= 80 ? "text-yellow-700"
                                        : "text-red-700";

                            return (
                                <tr
                                    key={student.student_id}
                                    className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === summary.length - 1 ? 'border-b-0' : ''}`}
                                >
                                    <th scope="row" className="px-2 py-3 font-semibold text-custom-black whitespace-nowrap sticky left-0 bg-inherit capitalize">
                                        {fullName}
                                    </th>

                                    <td className="px-2 py-3 text-center">
                                        {avg != null && avg > 0 ? (
                                            <span
                                                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-bold ${
                                                    isOutOfRange
                                                        ? "bg-amber-50 text-amber-700"
                                                        : isFailing
                                                            ? "bg-red-50 text-red-600"
                                                            : "bg-primary-shadow text-primary"
                                                }`}
                                                title={isOutOfRange ? "Promedio fuera de la escala — datos inconsistentes" : undefined}
                                            >
                                            {isOutOfRange ? "⚠ " : ""}{avg.toFixed(2)}
                                        </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>


                                    <td className="px-2 py-3 text-center">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${attColor}`}>
                                        {attRate}%
                                    </span>
                                    </td>
                                    <td className="px-2 py-3 text-center font-medium">
                                    <span className={student.total_absences > 3 ? "text-red-500" : "text-gray-600"}>
                                        {student.total_absences}
                                    </span>
                                    </td>
                                    <td className="px-2 py-3 text-center text-gray-500">
                                        {student.attendance?.late || 0}
                                    </td>
                                    <td className="px-2 py-3 text-center text-gray-500">
                                        {student.attendance?.excused || 0}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-3">
                        <div className="border rounded-xl border-gray-200 p-3 h-[230px] flex flex-col shrink-0">
                            <h3 className="text-sm font-semibold shrink-0">Asistencia del curso</h3>
                            <div className="flex-1 min-h-0">
                                <AttendanceDonut totals={totals} />
                            </div>
                        </div>
                        <div className="border rounded-xl border-gray-200 p-3 h-[230px] flex flex-col shrink-0">
                            <h3 className="text-sm font-semibold shrink-0">Nivel de desempeño del curso</h3>
                            <div className="flex-1 min-h-0">
                                <GradeDonut summary={summary} />
                            </div>
                        </div>
                        <div className="border rounded-xl border-gray-200 p-3 h-[300px] flex flex-col shrink-0">
                            <h3 className="text-sm font-semibold shrink-0 mb-2">Tendencia del curso</h3>
                            <div className="flex-1 min-h-0">
                                <CourseTrendChart trend={trend} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}