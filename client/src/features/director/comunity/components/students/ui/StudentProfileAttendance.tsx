import { LuCalendar, LuCalendarX, LuClock, LuUserCheck } from "react-icons/lu";
import {formatFullDateString} from "../../../../../utils/utils.ts";
import type { AttendanceSummary } from "../../../types";

interface StudentProfileAttendance {
    attendance: AttendanceSummary[];
}

export function StudentProfileAttendance({ attendance }: StudentProfileAttendance) {
    const recordedDays = attendance.filter(a => a.daily_status !== 'no_data');

    const total = recordedDays.length;
    const present = recordedDays.filter(a => a.daily_status === 'present').length;
    const absent = recordedDays.filter(a => a.daily_status === 'absent').length;
    const late = recordedDays.filter(a => a.daily_status === 'late').length;

    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return (
        <div className="animate-in fade-in duration-200 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Resumen de Asistencia</h2>

            <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-100 bg-white rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-gray-900">{total > 0 ? `${attendanceRate}%` : '-'}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase mt-1">Global</span>
                </div>
                <div className="p-4 border border-green-100 bg-green-50/50 rounded-xl flex flex-col items-center justify-center text-center">
                    <LuUserCheck className="size-5 text-green-600 mb-1" />
                    <span className="text-lg font-bold text-green-700">{present}</span>
                    <span className="text-[10px] font-semibold text-green-600 uppercase">Presente</span>
                </div>
                <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl flex flex-col items-center justify-center text-center">
                    <LuCalendarX className="size-5 text-red-600 mb-1" />
                    <span className="text-lg font-bold text-red-700">{absent}</span>
                    <span className="text-[10px] font-semibold text-red-600 uppercase">Ausente</span>
                </div>
                <div className="p-4 border border-yellow-100 bg-yellow-50/50 rounded-xl flex flex-col items-center justify-center text-center">
                    <LuClock className="size-5 text-yellow-600 mb-1" />
                    <span className="text-lg font-bold text-yellow-700">{late}</span>
                    <span className="text-[10px] font-semibold text-yellow-600 uppercase">Tarde</span>
                </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-4">Registro Reciente</h3>
            {recordedDays.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm">
                    No hay registros de asistencia evaluados en este periodo.
                </div>
            ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                    {recordedDays.slice(0, 5).map((record, idx) => (
                        <div key={record.date} className={`p-4 flex items-center justify-between ${idx !== 4 ? 'border-b border-gray-100' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg"><LuCalendar className="size-4 text-gray-400" /></div>
                                <p className="text-sm font-medium text-gray-900">{formatFullDateString(record.date)}</p>
                            </div>
                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                                record.daily_status === 'present' ? 'bg-green-100 text-green-700' :
                                    record.daily_status === 'absent' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                            }`}>
                                {record.daily_status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}