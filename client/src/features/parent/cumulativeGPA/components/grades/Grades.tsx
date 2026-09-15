import { useGrades } from "../../hooks/grades/useGrades.ts";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { toneBg } from "../../../../utils/utils.ts";
import { LuGraduationCap } from "react-icons/lu";

interface GradesProps {
    studentId: string;
    periodId: string;
}

function averageGrades(grades: any[]) {
    if (!grades || grades.length === 0) return 0;

    let list: number[] = [];
    for (const grade of grades) {
        list.push(Number(grade.final_grade) || 0);
    }
    return list.reduce((prev, current) => prev + current, 0) / list.length;
}

export function Grades({ studentId, periodId }: GradesProps) {
    const { loading, grades } = useGrades(studentId, periodId);

    if (loading || !periodId) return <LoadingContent title="" />;

    return (
        <div className="flex gap-3 flex-col md:flex-row justify-between">
            <div className="w-full p-5 ">
                <div className="flex justify-between mb-3 items-center">
                    <div>
                        <span className="text-primary-darker text-xs font-semibold">Rendimiento académico</span>
                        <h2 className="md:text-xl lg:text-2xl text-lg font-bold mb-2 text-left">Calificaciones</h2>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-primary-darker md:text-2xl text-xl lg:text-3xl font-bold">
                            {averageGrades(grades).toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xs">Promedio general</span>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                    {grades.length > 0 ? grades.map((grade) => (
                        <a
                            href="#"
                            key={grade.class_id}
                            className="p-3 bg-white rounded-xl flex justify-between w-full"
                        >
                            <div className="flex items-center w-full justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full bg-primary`} />
                                    <p className="capitalize font-semibold">{grade.subject_name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-full min-w-28 max-w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-xl transition-all duration-300 ${toneBg(Number(grade.final_grade), { min: Number(grade.scale_min), max: Number(grade.scale_max), passing: Number(grade.passing_value) })}`}
                                            style={{ width: `${(Number(grade.final_grade) / Number(grade.scale_max)) * 100}%` }}
                                        />
                                    </div>
                                    <p className="font-semibold text-right min-w-8">
                                        {Number(grade.final_grade) > 0 ? grade.final_grade : '-.-'}
                                    </p>
                                </div>
                            </div>
                        </a>
                    )) : (
                        <p className="text-sm text-gray-400">No hay calificaciones registradas para este periodo.</p>
                    )}
                </div>
            </div>
            <div className="w-full p-5">
                <div className="bg-primary-shadow/50 rounded-xl p-5 h-full">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="md:text-base text-sm font-bold">Radar Académico</h2>
                            <p className="text-gray-400 text-sm">Vista general por materia</p>
                        </div>
                        <div>
                            <LuGraduationCap className="size-6 text-primary-darker"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}