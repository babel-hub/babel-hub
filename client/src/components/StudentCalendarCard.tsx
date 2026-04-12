import {memo, useCallback, useEffect, useState} from "react";
import api from "../api/client.ts";
import {getStatusDotColor} from "../types";
import axios from "axios";

interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface AttendanceByCalendar {
    date: string;
    daily_status: string;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        dayNum: date.getUTCDate(),
        month: date.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
        weekday: date.toLocaleString('es-ES', { weekday: 'short', timeZone: 'UTC' }).toUpperCase()
    };
};

const StudentCalendarCardComponent = ({ studentId, period }: { studentId: string, period: Period }) => {
    const [calendarData, setCalendarData] = useState<AttendanceByCalendar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCalendar = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);

        try {
            const response = await api.get(
                `/attendance/summary/calendar?startDate=${period.start_date}&endDate=${period.end_date}&studentId=${studentId}`,
                { signal }
            );

            setCalendarData(response.data.attendanceByCalendar || response.data);
            setLoading(false);
        } catch (error: any) {
            if (axios.isCancel(error) || (error as Error).name === 'AbortError') return;

            console.error(error);
            setError(error.response?.data?.message || error.message || "Error al cargar...");

            setLoading(false);
        }
    }, [studentId, period]);

    useEffect(() => {
        const controller = new AbortController()

        fetchCalendar(controller.signal);

        return () => controller.abort();
    }, [fetchCalendar]);

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>;
    if (error) return <div className="p-4 text-center text-sm text-red-500">{error}</div>;

    return (
        <div className="py-2 px-3 bg-white rounded-xl no-scrollbar mr-3 overflow-x-auto">
            <div className="flex gap-1.5">
                {[...calendarData].reverse().map(day => {
                    const statusColor = getStatusDotColor(day.daily_status);
                    const { dayNum, month, weekday } = formatDate(day.date);

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

const StudentCalendarCard = memo(StudentCalendarCardComponent);

export default StudentCalendarCard;