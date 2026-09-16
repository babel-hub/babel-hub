import { LoadingContent } from "../../../../../../components/ui/Loadings.tsx";
import { formatterDate, reverseName } from "../../../../../../types";
import { usePeriodAttendance } from "../../hooks/usePeriodAttendance.ts";
import { NoResults } from "../../../../../../components/ui/blocks/NoResults.tsx";
import {formatDateParts, formatDatePeriod} from "../../../../../utils/utils.ts";
import type { Period } from "../../../../../../shared/types/types.ts";

interface ViewAttendanceProps {
    courseId: string;
    classId: string;
    periodId: string;
    periods: Period[];
}

export function ViewAttendance({ courseId, classId, periodId, periods }: ViewAttendanceProps) {
    const selectedPeriod = periods?.find(p => p.id === periodId);
    const todayStr = formatterDate.format(new Date());

    const startDate = selectedPeriod?.start_date ? selectedPeriod.start_date.slice(0, 10) : "";
    const endDate = selectedPeriod?.end_date ? selectedPeriod.end_date.slice(0, 10) : "";

    const { loading, calendarDates, periodAttendance } = usePeriodAttendance({
        courseId,
        classId,
        startDate,
        endDate
    });

    if (!periods || periods.length === 0) {
        return <NoResults title="No se encontraron periodos" />;
    }

    if (!periodId || loading || !selectedPeriod) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {loading ? (
                <div className="p-5">
                    <LoadingContent title="Cargando asistencia..." />
                </div>
            ) : (
                <div>
                    <div className="bg-white border-b-2 border-gray-100">
                        <div className="flex items-center border-b-2 border-gray-100 py-2 px-3 md:p-4 justify-end sm:justify-between">
                            <div className="w-full hidden sm:flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                    <div>
                                        <p className="text-primary-darker capitalize text-xs font-semibold">rango de periodo</p>
                                        <p className="text-custom-black capitalize font-semibold text-sm">
                                            {formatDatePeriod(selectedPeriod.start_date, selectedPeriod.end_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-green-500" /><p className="text-custom-black text-xs">Presente</p></div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-red-500" /><p className="text-custom-black text-xs">Ausente</p></div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-yellow-500" /><p className="text-custom-black text-xs">Tarde</p></div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 block rounded-full bg-blue-500" /><p className="text-custom-black text-xs">Justificado</p></div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead>
                                <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-wider">
                                    <th className="sticky left-0 bg-gray-50 sm:p-3 p-2 md:p-4 border-b border-r border-gray-100 z-20 font-bold min-w-[200px]">
                                        Estudiante
                                    </th>
                                    {calendarDates.map(date => {
                                        const { dayNum, month, weekday } = formatDateParts(date);

                                        return (
                                            <th key={date} className="p-1 border-b border-gray-100 text-center font-semibold w-8">
                                                <div className="text-[10px] flex flex-col items-center font-medium text-gray-400">
                                                    <span>{dayNum}</span>
                                                    <span className="text-custom-black -my-1">{month}</span>
                                                    <span>{weekday}</span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {
                                    periodAttendance.length > 0 ? (
                                        periodAttendance.map((student) => {
                                            const formattedName = reverseName({
                                                firstLastName: student.firstLastName,
                                                firstName: student.firstName,
                                                middleName: student.middleName,
                                                secondLastName: student.secondLastName
                                            })

                                            return (
                                                <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="sticky left-0 bg-white py-3 px-2 md:p-4 border-r border-gray-100 z-10">
                                                        <div className="truncate max-w-[200px] font-medium capitalize text-custom-black text-sm" title={formattedName}>
                                                            {formattedName}
                                                        </div>
                                                    </td>
                                                    {student.records.map((record: any, idx: number) => {
                                                        let bg = "bg-gray-100";
                                                        if (record.status === 'present') bg = "bg-green-500 shadow-sm";
                                                        if (record.status === 'absent') bg = "bg-red-500 shadow-sm";
                                                        if (record.status === 'late') bg = "bg-yellow-300 shadow-sm";
                                                        if (record.status === 'excused') bg = "bg-blue-500 shadow-sm";

                                                        return (
                                                            <td key={idx} className="p-2 text-center border-r border-gray-50 last:border-0">
                                                                <div className={`w-3.5 h-3.5 mx-auto rounded-full ${bg}`} title={`${record.date.split('T')[0]}: ${record.status}`}></div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={calendarDates.length > 0 ? calendarDates.length + 1 : 2} className="text-center text-sm md:text-base text-gray-500 py-8">
                                                {
                                                    (selectedPeriod?.start_date && todayStr < selectedPeriod.start_date.slice(0, 10))
                                                        ? (
                                                            <div className="md:col-span-2 lg:col-span-3">
                                                                <NoResults title="Este periodo aún no ha comenzado"/>
                                                            </div>
                                                        )
                                                        : (
                                                            <div className="md:col-span-2 lg:col-span-3">
                                                                <NoResults title="No hay estudiantes para mostrar su asistencia"/>
                                                            </div>
                                                        )
                                                }
                                            </td>
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}