import {useEffect, useState} from "react";
import api from "../api/client.ts";

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

export default function StudentCalendarCard({ studentId, period }: { studentId: string, period: Period }) {
    const [calendarData, setCalendarData] = useState<AttendanceByCalendar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/attendance/summary/calendar?startDate=${period.start_date}&endDate=${period.end_date}&studentId=${studentId}`);
                setCalendarData(response.data.attendanceByCalendar || response.data);
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar el calendario.");
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, [studentId, period]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500 border-green-600';
            case 'absent': return 'bg-red-500 border-red-600';
            case 'late': return 'bg-yellow-300 border-yellow-300';
            default: return 'bg-gray-100 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            dayNum: date.getUTCDate(),
            month: date.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
            weekday: date.toLocaleString('es-ES', { weekday: 'short', timeZone: 'UTC' }).toUpperCase()
        };
    };

    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>;
    if (error) return <div className="p-4 text-center text-sm text-red-500">{error}</div>;

    return (
        <div className="py-2 px-3 bg-white rounded-xl no-scrollbar mr-3 overflow-x-auto">
            <div className="flex gap-1.5">
                {[...calendarData].reverse().map(day => {
                    const statusColor = getStatusColor(day.daily_status);
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
}