import {LuBookOpen} from "react-icons/lu";
import {formatFullDateString} from "../../../../../utils/utils.ts";

export function StudentProfileGrades({ grades }: { grades: any[] }) {
    if (!grades || grades.length === 0) {
        return (
            <div className="animate-in fade-in duration-200 max-w-3xl">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Calificaciones</h2>
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                    No hay calificaciones registradas en este periodo.
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-200 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Últimas Calificaciones</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                {grades.map((grade, idx) => {
                    const numericGrade = parseFloat(grade.value);
                    return (
                        <div key={grade.assignment_id} className={`p-4 flex items-center justify-between ${idx !== grades.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg"><LuBookOpen className="size-5 text-gray-400" /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 capitalize">{grade.assignment_title}</p>
                                    <p className="text-xs font-medium text-gray-500 capitalize">{grade.class_name} • {formatFullDateString(grade.graded_at)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold ${numericGrade >= 3.0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {numericGrade.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}