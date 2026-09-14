import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { reverseName } from "../../../../../types";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { useAttendanceGrid } from "../../hooks/useAttendanceGrid.ts";
import type { ClassDetailsData } from "../../types";
import {useEffect, useState} from "react";
import { usePeriods } from "../../../../../shared/hooks/usePeriods.ts";
import { formatDateParts, formatDatePeriod } from "../../../../utils/utils.ts";

interface ViewAttendanceProps {
    classData: ClassDetailsData;
    courseId: string;
}

export function ViewAttendance({ classData, courseId }: ViewAttendanceProps) {
    const { periods } = usePeriods();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    const selectedPeriod = periods?.find(p => p.id === selectedPeriodId);

    const startDate = selectedPeriod?.start_date ? selectedPeriod.start_date.slice(0, 10) : "";
    const endDate = selectedPeriod?.end_date ? selectedPeriod.end_date.slice(0, 10) : "";

    const { loading, calendar, attendance } = useAttendanceGrid({
        courseId,
        classId: classData.details.id,
        students: classData.students.length,
        startDate,
        endDate
    });

    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;
    if (!selectedPeriodId || loading || !selectedPeriod) return null;

    return (
        <div className="max-w-4xl mx-auto">
            {loading ? (
                <div className="p-5">
                    <LoadingContent title="Cargando asistencia..." />
                </div>
            ) : (
                <div>
                    <div className="w-full flex justify-between items-center p-2">
                        <div className="flex gap-2 items-center">
                            <div className="pl-2">
                                <p className="text-primary-darker uppercase text-[10px] sm:text-xs font-bold">rango de periodo</p>
                                <p className="text-custom-black capitalize font-semibold text-xs sm:text-sm">
                                    {formatDatePeriod(selectedPeriod.start_date, selectedPeriod.end_date)}
                                </p>
                            </div>
                        </div>
                        <select
                            className="text-sm capitalize appearance-none text-custom-black border border-gray-200 rounded-xl md:px-4 p-2 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                            value={selectedPeriod?.id || ""}
                            onChange={(e) => setSelectedPeriodId(e.target.value)}
                            disabled={classData.students.length === 0}
                        >
                            {periods?.map(p => (
                                <option className="bg-white text-primary-darker" key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white border-t-2 border-gray-100">
                        <div className="flex items-center border-b-2 border-gray-100 p-3 md:p-4 justify-end sm:justify-between">
                            <p className="text-custom-black text-sm hidden sm:block md:text-base font-semibold">Registro Diario</p>
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
                                    {calendar.map(date => {
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
                                    attendance.length > 0 ? (
                                        attendance.map((student) => {
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
                                            <td colSpan={calendar.length > 0 ? calendar.length + 1 : 2} className="text-center text-sm md:text-base text-gray-500">
                                                {
                                                    (selectedPeriod?.start_date && new Date() < new Date(selectedPeriod.start_date))
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
    );
}