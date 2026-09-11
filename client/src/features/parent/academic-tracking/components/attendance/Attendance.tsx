import { useAttendance } from "../../hooks/attendance/useAttendance.ts";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { BsCalendar4Week } from "react-icons/bs";
import { GoClock, GoCheckCircle, GoXCircle, GoDash } from "react-icons/go";
import { useState } from "react";
import type { ParentStudent } from "../../../shared/types/types.ts";

interface AttendanceProps {
    students: ParentStudent[];
    date: string;
}

export function Attendance({ students, date }: AttendanceProps) {
    const [attendanceDate, setAttendanceDate] = useState<string>(date);
    const { loading, attendance } = useAttendance(students[0]?.student_id, attendanceDate);

    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(attendanceDate + 'T00:00:00'));

    if (loading) return <LoadingContent title="" />;

    const presentCount = attendance?.filter((a: any) => a.status === 'present').length || 0;
    const lateCount = attendance?.filter((a: any) => a.status === 'late').length || 0;
    const absentCount = attendance?.filter((a: any) => a.status === 'absent').length || 0;

    const firstAttendance = attendance
        ?.filter((a: any) => a.recorded_at && a.status !== 'no_data')
        .sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())[0];

    const generalStatus = firstAttendance?.status || 'no_data';

    const entryTime = firstAttendance?.recorded_at
        ? new Date(firstAttendance.recorded_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
        : '--:--';

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'present': return { text: 'Asistió', color: 'text-green-500', bg: 'bg-green-50', icon: <GoCheckCircle className="size-12 text-green-500" />, badge: 'bg-green-100 text-green-700' };
            case 'late': return { text: 'Llegó tarde', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: <GoClock className="size-12 text-yellow-500" />, badge: 'bg-yellow-100 text-yellow-700' };
            case 'absent': return { text: 'No asistió', color: 'text-red-500', bg: 'bg-red-50', icon: <GoXCircle className="size-12 text-red-500" />, badge: 'bg-red-100 text-red-700' };
            default: return { text: 'Sin registro', color: 'text-gray-400', bg: 'bg-gray-50', icon: <GoDash className="size-12 text-gray-400" />, badge: 'bg-gray-100 text-gray-600' };
        }
    };

    const generalUI = getStatusUI(generalStatus);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            <div className="bg-white col-span-2 p-5 border border-gray-100 md:rounded-xl w-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 rounded-xl p-2">
                            <BsCalendar4Week className="size-5 text-primary" />
                        </div>
                        <h2 className="capitalize font-bold text-base md:text-lg text-custom-black">
                            {formattedDate}
                        </h2>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="bg-gray-50 md:text-base text-sm border border-gray-200 text-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    <div className="border border-gray-200 p-4 rounded-2xl col-span-2 flex flex-col justify-between">
                        <h3 className="text-gray-500 font-medium text-sm mb-2">Estado general del día</h3>
                        <div className="flex items-center gap-2">
                            <div>
                                {generalUI.icon}
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${generalUI.color}`}>{generalUI.text}</p>
                                {generalStatus !== 'no_data' && (
                                    <p className="text-sm text-gray-700 font-medium mt-1">Entrada: {entryTime}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div><GoCheckCircle className="size-10 text-green-500" /></div>
                        <p className="font-bold text-gray-800 text-sm">Asistió</p>
                        <p className="text-green-500 font-bold text-xl">{presentCount}</p>
                        <span className="text-xs font-medium text-gray-500">bloques</span>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div><GoClock className="size-10 text-yellow-500" /></div>
                        <p className="font-bold text-gray-800 text-sm">Llegó tarde</p>
                        <p className="text-yellow-500 font-bold text-xl">{lateCount}</p>
                        <span className="text-xs font-medium text-gray-500">bloque{lateCount !== 1 && 's'}</span>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div><GoXCircle className="size-10 text-red-500" /></div>
                        <p className="font-bold text-gray-800 text-sm">No asistió</p>
                        <p className="text-red-500 font-bold text-xl">{absentCount}</p>
                        <span className="text-xs font-medium text-gray-500">bloque{absentCount !== 1 && 's'}</span>
                    </div>
                </div>

                <div className="w-full mt-5">
                    <h3 className="font-bold text-lg text-custom-black mb-4">Asistencia por bloque</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-primary-shadow">
                            <tr className="border-b border-gray-200 text-sm text-gray-500">
                                <th className="py-3 rounded-tl-xl px-4 font-medium">Bloque</th>
                                <th className="py-3 px-4 font-medium">Materia</th>
                                <th className="py-3 px-4 font-medium">Estado</th>
                                <th className="py-3 rounded-tr-xl px-4 font-medium">Detalle</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attendance?.map((block: any, index: number) => {
                                const ui = getStatusUI(block.status);
                                const time = block.recorded_at
                                    ? new Date(block.recorded_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
                                    : '—';
                                return (
                                    <tr key={block.class_id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-custom-black">{index + 1}</td>
                                        <td className="py-4 px-4 text-gray-700 capitalize font-medium">{block.class_name}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${ui.badge}`}>
                                                {ui.icon && <span className="[&>svg]:size-3">{ui.icon}</span>}
                                                {ui.text}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {block.status === 'late' ? `Llegada: ${time}` : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="bg-white md:rounded-xl border border-gray-100 w-full"></div>
        </div>
    );
}