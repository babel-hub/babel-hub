import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import type { StudentDailyGrade } from "../../types/types.ts";
import {BsStars} from "react-icons/bs";

export const CRITERIA_COLORS = ['#F5A524', '#F31260', '#F76B15', '#17C964'];

export function formatDayLabel(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);
    const formatted = date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    // "miércoles, 3 de junio" -> "Miércoles, 3 de junio"
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function shiftDay(dateStr: string, offset: number): string {
    const date = new Date(`${dateStr}T00:00:00`);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

export function isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().slice(0, 10);
}

interface DayDetailPanelProps {
    subjectName: string | null;
    date: string;
    onDateChange: (date: string) => void;
    grades: StudentDailyGrade[];
}

export function DayDetailPanel({ subjectName, date, onDateChange, grades }: DayDetailPanelProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 col-span-1 md:col-span-2 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <button
                            onClick={() => onDateChange(shiftDay(date, -1))}
                            className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            aria-label="Día anterior"
                        >
                            <HiChevronLeft />
                        </button>
                        <span>{formatDayLabel(date)}</span>
                        <button
                            onClick={() => onDateChange(shiftDay(date, 1))}
                            disabled={isToday(date)}
                            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Día siguiente"
                        >
                            <HiChevronRight />
                        </button>
                    </div>
                    <h3 className="text-custom-black font-bold text-xl md:text-2xl capitalize mt-1">
                        {subjectName ?? "Selecciona una materia"}
                    </h3>
                    {grades.length > 0 && (
                        <p className="text-gray-500 text-sm mt-1">
                            {grades.length} {grades.length === 1 ? "calificación registrada" : "calificaciones registradas"} hoy
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {grades.length > 0 ? (
                    grades.map((g) => (
                        <div key={g.assignment_id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <span className="w-9 h-9 shrink-0 rounded-lg bg-primary-shadow text-primary font-bold text-sm flex items-center justify-center">
                                        {g.grade}
                                    </span>
                                    <div>
                                        <p className="font-bold text-custom-black text-sm md:text-base">{g.assignment_name}</p>
                                        <p className="text-primary text-xs font-medium capitalize">{g.criteria_name}</p>
                                    </div>
                                </div>
                                <span className="text-gray-400 text-xs bg-gray-50 rounded-full px-2 py-1 shrink-0">
                                    {formatTime(g.graded_at)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-400 text-[10px] font-semibold tracking-wide">Actividad</p>
                                    <p className="text-custom-black text-sm mt-0.5">{g.assignment_name}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-gray-400 text-[10px] font-semibold tracking-wide">Comentario docente</p>
                                    <p className="text-custom-black text-sm mt-0.5">{g.comment ?? "Sin comentario registrado."}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <NoResults title="No hay calificaciones este día" />
                )}
            </div>

            <div className="bg-primary-shadow rounded-xl p-2 text-primary-darker flex items-start gap-2">
                <BsStars className="size-6 mt-0.5"/>
                <p className="text-sm">Puedes encontrar más información sobre cada calificación en su criterio, actividad y comentario docente.</p>
            </div>
        </div>
    );
}