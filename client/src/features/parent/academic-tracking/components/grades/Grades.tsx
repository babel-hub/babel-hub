import type { ParentStudent } from "../../../shared/types/types.ts";
import { useDailyGrades } from "../../hooks/grades/useDailyGrades.ts";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { useEffect, useMemo, useState } from "react";
import type { StudentDailyGrade } from "../../types/types.ts";

interface GradesProps {
    students: ParentStudent[];
    date: string;
}

export function Grades({ students, date }: GradesProps) {
    const studentId = students[0]?.student_id ?? '';
    const { loading, grades } = useDailyGrades(studentId, date);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const gradesBySubject = useMemo(() => {
        const map = new Map<string, StudentDailyGrade[]>();
        for (const g of grades) {
            const list = map.get(g.subject_name) ?? [];
            list.push(g);
            map.set(g.subject_name, list);
        }
        return map;
    }, [grades]);

    const subjectNames = useMemo(() => Array.from(gradesBySubject.keys()), [gradesBySubject]);

    useEffect(() => {
        setSelectedSubject((prev) => {
            if (prev && subjectNames.includes(prev)) return prev;
            return subjectNames.length > 0 ? subjectNames[0] : null;
        });
    }, [subjectNames]);

    if (students.length === 0) {
        return <NoResults title="No hay estudiantes registrados" />;
    }

    if (loading) return <LoadingContent title="" />;

    const selectedGrades = selectedSubject ? gradesBySubject.get(selectedSubject) ?? [] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
            <div className="flex flex-col gap-2 p-3 bg-white md:rounded-xl border border-gray-100">
                <div>
                    <span className="text-primary-darker uppercase text-xs font-semibold">Calificaciones</span>
                    <h3 className="text-custom-black font-bold text-base md:text-xl">Materias</h3>
                    <p className="text-gray-500 text-sm">Selecciona una para ver su detalle</p>
                </div>
                <div className="flex flex-col gap-2">
                    {subjectNames.length > 0 ? (
                        subjectNames.map((subjectName) => {
                            const subjectGrades = gradesBySubject.get(subjectName)!;
                            const isSelected = subjectName === selectedSubject;

                            return (
                                <button
                                    key={subjectName}
                                    onClick={() => setSelectedSubject(subjectName)}
                                    aria-pressed={isSelected}
                                    className={`flex cursor-pointer p-2 rounded-xl border justify-between items-center gap-5 transition-colors
                                        ${isSelected ? 'bg-primary/10 border-primary/20' : 'border-transparent hover:bg-gray-100 hover:border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                                        <p className='font-semibold text-sm md:text-base capitalize text-custom-black'>{subjectName}</p>
                                    </div>
                                    <p className="font-semibold">{subjectGrades[0]?.grade}</p>
                                </button>
                            );
                        })
                    ) : (
                        <NoResults title="No hay resultados" />
                    )}
                </div>
            </div>

            <div className="bg-white md:rounded-xl col-span-2 p-3 border border-gray-100">
                {selectedGrades.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-custom-black font-bold text-base md:text-lg capitalize">{selectedSubject}</h3>
                        {selectedGrades.map((g) => (
                            <div key={g.assignment_id} className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-custom-black">{g.assignment_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{g.criteria_name}</p>
                                    </div>
                                    <span className="font-bold text-base text-custom-black">{g.grade}</span>
                                </div>
                                {g.comment && (
                                    <p className="text-xs text-gray-600 italic mt-1">"{g.comment}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <NoResults title="No hay resultados" />
                )}
            </div>

            <div className="bg-white md:rounded-xl border border-gray-100">
            </div>
        </div>
    );
}