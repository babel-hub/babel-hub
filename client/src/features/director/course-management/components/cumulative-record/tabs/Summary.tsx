import { reverseName } from "../../../../../../types";
import { NoResults } from "../../../../../../components/ui/blocks/NoResults.tsx";
import type {CumulativeSummary} from "../../../types";
import {LoadingContent} from "../../../../../../components/ui/Loadings.tsx";

interface SummaryProps {
    summary: CumulativeSummary[];
    loading: boolean;
}

export function Summary({ summary, loading }: SummaryProps) {
    if (loading) return <LoadingContent title="" />;
    if (!summary || summary.length === 0) return <NoResults title="No hay datos registrados para este curso en este periodo"/>;

    return (
        <div className="px-4 pb-4 grid grid-cols-5 gap-3">
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
                            <th scope="col" className="p-2 min-w-[100px] text-center">
                                Faltas
                            </th>
                            <th scope="col" className="p-2 min-w-[100px] text-center">
                                Retardos
                            </th>
                            <th scope="col" className="p-2 min-w-[100px] text-center">
                                Excusas
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
                        })

                        const avg = student.period_average ?? 0;
                        const isFailing = avg > 0 && avg < 3.0;

                        const attRate = student.attendance_rate ?? 0;
                        const attColor = attRate >= 90
                            ? 'text-green-700'
                            : attRate >= 80
                                ? 'text-yellow-700'
                                : 'text-red-700';

                        return (
                            <tr
                                key={student.student_id}
                                className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === summary.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <th scope="row" className="px-2 py-3 font-semibold text-custom-black whitespace-nowrap sticky left-0 bg-inherit shadow-[1px_0_0_0_#e5e7eb] capitalize">
                                    {fullName}
                                </th>

                                <td className="px-2 py-3 text-center">
                                    {student.period_average ? (
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-bold ${isFailing ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                                {student.period_average.toFixed(2)}
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

            <div className="w-full h-auto col-span-2 flex flex-col gap-3">
                <div className="border rounded-xl border-gray-200 h-full p-2"></div>
                <div className="border rounded-xl border-gray-200 h-full p-2"></div>
            </div>
        </div>
    );
}