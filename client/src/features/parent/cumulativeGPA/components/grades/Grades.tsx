import { useGrades } from "../../hooks/grades/useGrades.ts";
import { toneBg } from "../../../../../types";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import {LuGraduationCap} from "react-icons/lu";
import type { ParentStudent } from "../../../shared/types/types.ts";

interface GradesProps {
    students: ParentStudent[];
    periodId: string;
}

function averageGrades(grades: any[]) {
    let list: number[] = [];
    for (const grade of grades) {
        list.push(grade.final_grade);
    }
    return list.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / list.length;
}

export function Grades({ students, periodId }: GradesProps) {
    const { loading, grades } = useGrades(students[0]?.student_id, periodId);

    if (loading || !periodId) return <LoadingContent title="" />;

    return (
        <div className="flex gap-5 flex-col md:flex-row justify-between">
            <div className="w-full p-5 ">
                <div className="flex justify-between mb-3 items-center">
                    <div>
                        <span className="text-primary-darker text-xs font-semibold">Rendimiento académico</span>
                        <h2 className="md:text-xl lg:text-2xl text-lg font-bold mb-2 text-left">Calificaciones</h2>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-primary-darker md:text-2xl text-xl lg:text-3xl font-bold">{averageGrades(grades).toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">Promedio general</span>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                    {grades.map((grade) => (
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
                                            className={`h-full rounded-xl transition-all duration-300 ${toneBg(grade.final_grade, { min: grade.scale_min, max: grade.scale_max, passing: grade.passing_value })}`}
                                            style={{ width: `${(grade.final_grade / grade.scale_max) * 100}%` }}
                                        />
                                    </div>
                                    <p className="font-semibold text-right min-w-6">{grade.final_grade}</p>
                                </div>
                            </div>
                        </a>
                    ))}
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