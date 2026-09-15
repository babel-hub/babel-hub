import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { formatDayLabel, formatTime } from "../../../../utils/utils.ts";
import type { StudentDailyGrade } from "../../types/types.ts";
import { BsStars } from "react-icons/bs";
import {toneBgandText} from "../../../../../utils/utils.ts";

interface DayDetailPanelProps {
    subjectName: string | null;
    date: string;
    grades: StudentDailyGrade[];
    scales: { max: number; min: number, passing: number };
}

export function DayDetailPanel({ subjectName, date, grades, scales }: DayDetailPanelProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 md:col-span-2 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center text-gray-400 font-medium text-sm">
                        <span>Detalle del día {formatDayLabel(date)}</span>
                    </div>
                    <h3 className="text-custom-black font-bold text-lg md:text-xl lg:text-2xl capitalize mt-1">
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
                                    <span className={`w-9 h-9 shrink-0 rounded-lg font-bold text-sm flex items-center justify-center ${
                                        toneBgandText(Number(g.grade), {
                                            max: scales.max,
                                            min: scales.min,
                                            passing: scales.passing
                                        })
                                    }`}>
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
                    <NoResults title="No hay calificaciones para este día" />
                )}
            </div>

            <div className="bg-primary-shadow rounded-xl p-2 text-primary-darker flex items-start gap-2">
                <BsStars className="size-4 md:size-6 min-w-4 md:min-w-6 mt-0.5"/>
                <p className="text-sm">Puedes encontrar más información sobre cada calificación en su criterio, actividad y comentario docente.</p>
            </div>
        </div>
    );
}