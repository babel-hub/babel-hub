import { useAttendance } from "../../hooks/attendance/useAttendance.ts";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { GoClock, GoCheckCircle, GoXCircle, GoDash } from "react-icons/go";
import { formatDayLabel } from "../../../../utils/utils.ts";
import {NoResults} from "../../../../../components/ui/blocks/NoResults.tsx";

interface AttendanceProps {
    studentId: string;
    date: string;
}

export function Attendance({ studentId, date }: AttendanceProps) {
    const { loading, attendance } = useAttendance(studentId, date);

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
            case 'present': return { text: 'Asistió', color: 'text-green-500', bg: 'bg-green-50', icon: <GoCheckCircle className="size-8 lg:size-12 text-green-500" />, badge: 'bg-green-100 text-green-700' };
            case 'excused': return { text: 'Excusado', color: 'text-blue-500', bg: 'bg-blue-50', icon: <GoCheckCircle className="size-8 lg:size-12 text-blue-500" />, badge: 'bg-blue-100 text-blue-700' };
            case 'late': return { text: 'Llegó tarde', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: <GoClock className="size-8 lg:size-12 text-yellow-500" />, badge: 'bg-yellow-100 text-yellow-700' };
            case 'absent': return { text: 'No asistió', color: 'text-red-500', bg: 'bg-red-50', icon: <GoXCircle className="size-8 lg:size-12 text-red-500" />, badge: 'bg-red-100 text-red-700' };
            default: return { text: 'Sin registro', color: 'text-gray-400', bg: 'bg-gray-50', icon: <GoDash className="size-8 text-gray-400" />, badge: 'bg-gray-100 text-gray-600' };
        }
    };

    const generalUI = getStatusUI(generalStatus);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
            <div className="bg-white col-span-2 p-5 border border-gray-100 md:rounded-xl w-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col items-start">
                        <p className="text-gray-400 font-medium text-sm">Detalle de la asitencia</p>
                        <h2 className="font-semibold text-base md:text-lg text-custom-black">
                            {formatDayLabel(date)}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-rows-2 sm:grid-rows-1 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="border border-gray-200 p-4 rounded-xl col-span-3 sm:col-span-1 lg:col-span-2 flex flex-col justify-between">
                        <h3 className="text-gray-500 font-medium text-sm mb-2">Estado general del día</h3>
                        <div className="flex items-center gap-2">
                            <div>
                                <p className={`text-base lg:text-lg font-bold ${generalUI.color}`}>{generalUI.text}</p>
                                {generalStatus !== 'no_data' && (
                                    <p className="text-sm text-gray-700 font-medium mt-1">Entrada: {entryTime}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-xl gap-3 flex flex-col items-start justify-center text-center">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <GoCheckCircle className="size-6 text-green-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-custom-black text-sm">Asistió</p>
                            <div className="flex items-end gap-1">
                                <p className="text-green-500 font-bold text-xl">{presentCount}</p>
                                <span className="text-xs font-medium mb-0.5 text-gray-500">bloques</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-xl gap-3 flex flex-col items-start justify-center text-center">
                        <div className="bg-yellow-100 p-2 rounded-xl">
                            <GoClock className="size-6 text-yellow-500" />
                        </div>
                        <div className="text-left">
                            <p className="font-normal text-custom-black text-sm">Llegó tarde</p>
                            <div className="flex items-end gap-1">
                                <p className="text-yellow-500 font-bold text-xl">{lateCount}</p>
                                <span className="text-xs font-medium mb-0.5 text-gray-500">bloque{lateCount !== 1 && 's'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded-xl gap-3 flex flex-col items-start justify-center text-center">
                        <div className="bg-red-100 p-2 rounded-xl">
                            <GoXCircle className="size-6 text-red-500" />
                        </div>
                        <div className="text-left">
                            <p className="font-normal text-custom-black text-sm">No asistió</p>
                            <div className="flex items-end gap-1">
                                <p className="text-red-500 font-bold text-xl">{absentCount}</p>
                                <span className="text-xs font-medium mb-0.5 text-gray-500">bloque{absentCount !== 1 && 's'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-5">
                    <h3 className="font-bold text-lg text-custom-black mb-4">Asistencia por bloque</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-primary-shadow">
                                <tr className="text-sm text-primary-darker">
                                    <th className="py-3 rounded-tl-xl px-4 font-medium">Bloque</th>
                                    <th className="py-3 px-4 font-medium">Materia</th>
                                    <th className="py-3 px-4 font-medium">Estado</th>
                                    <th className="py-3 rounded-tr-xl px-4 font-medium">Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (attendance?.length ?? 0) > 0 ? (
                                    attendance?.map((block: any, index: number) => {
                                        const ui = getStatusUI(block.status);
                                        const time = block.recorded_at
                                            ? new Date(block.recorded_at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
                                            : '—';
                                        return (
                                            <tr key={block.class_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="pt-3">
                                            <div className="flex justify-center w-full">
                                                <NoResults title="No se encontraron asistencias" />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="bg-white md:rounded-xl border border-gray-100 w-full"></div>
        </div>
    );
}