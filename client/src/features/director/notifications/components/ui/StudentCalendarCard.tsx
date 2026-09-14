import { useAttendanceStudentCalendar } from "../../hooks/useAttendanceStudentCalendar.ts";
import type { Period } from "../../../../../shared/types/types.ts";
import { getStatusDotColor, formatDateParts } from "../../../../utils/utils.ts";

export default function StudentCalendarCardComponent ({ studentId, period }: { studentId: string, period: Period }){
    const { attendance, loading, error } = useAttendanceStudentCalendar({
        endDate: period.end_date,
        startDate: period.start_date,
        studentId: studentId
    })

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>;
    if (error) return <div className="p-4 text-center text-sm text-red-500">{error}</div>;

    return (
        <div className="py-2 px-3 bg-white rounded-xl no-scrollbar mr-3 overflow-x-auto">
            <div className="flex gap-1.5">
                {[...attendance].reverse().map(day => {
                    const statusColor = getStatusDotColor(day.daily_status);
                    const { dayNum, month, weekday } = formatDateParts(day.date);

                    return (
                        <div
                            key={day.date}
                            className="flex flex-col items-center gap-1 min-w-[24px]"
                            title={`${day.date.split("T")[0]} - ${day.daily_status}`}
                        >
                            <div className="text-[10px] flex flex-col items-center font-medium text-gray-400">
                                <span>{dayNum}</span>
                                <span className="text-custom-black -my-1">{month}</span>
                                <span>{weekday}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border ${statusColor}`}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};