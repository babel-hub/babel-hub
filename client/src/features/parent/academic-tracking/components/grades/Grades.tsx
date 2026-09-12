import type { ParentStudent } from "../../../shared/types/types.ts";
import { useDailyGrades } from "../../hooks/grades/useDailyGrades.ts";
import { useAccumulatedGrades } from "../../hooks/grades/useAccumulatedGrades.ts";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { useEffect, useMemo, useState } from "react";
import { DayDetailPanel } from "./DayDetailPanel.tsx";
import { AccumulatedPanel } from "./AccumulatedPanel.tsx";
import type { StudentDailyGrade } from "../../types/types.ts";

interface GradesProps {
    students: ParentStudent[];
    date: string;
}

type SelectedSubject = {
    classId: string;
    subjectName: string;
};

type SubjectGroup = {
    classId: string;
    subjectName: string;
    grades: StudentDailyGrade[];
};

export function Grades({ students, date: initialDate }: GradesProps) {
    const studentId = students[0]?.student_id ?? '';
    const [date, setDate] = useState(initialDate);

    const { loading, grades } = useDailyGrades(studentId, date);
    const [selectedSubject, setSelectedSubject] = useState<SelectedSubject | null>(null);

    const { accumulatedGrades: accumulated, loading: loadingAccumulated } =
        useAccumulatedGrades(
            studentId,
            selectedSubject?.classId ?? '',
            selectedSubject?.subjectName ?? '',
        );

    const subjectsByClass = useMemo(() => {
        const map = new Map<string, SubjectGroup>();
        for (const g of grades) {
            const entry = map.get(g.class_id) ?? {
                classId: g.class_id,
                subjectName: g.subject_name,
                grades: [],
            };
            entry.grades.push(g);
            map.set(g.class_id, entry);
        }
        return map;
    }, [grades]);

    const subjectGroups = useMemo(
        () => Array.from(subjectsByClass.values()),
        [subjectsByClass],
    );

    useEffect(() => {
        setSelectedSubject((prev) => {
            if (prev && subjectsByClass.has(prev.classId)) return prev;
            const first = subjectsByClass.values().next().value;
            return first ? { classId: first.classId, subjectName: first.subjectName } : null;
        });
    }, [subjectsByClass]);

    if (students.length === 0) {
        return <NoResults title="No hay estudiantes registrados" />;
    }

    if (loading) return <LoadingContent title="" />;

    const selectedGrades = selectedSubject ? subjectsByClass.get(selectedSubject.classId)?.grades ?? [] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
            <div className="flex flex-col gap-2 p-4 md:p-5 bg-white rounded-xl border border-gray-100">
                <div>
                    <span className="text-primary-darker uppercase text-xs font-semibold">Calificaciones</span>
                    <h3 className="text-custom-black font-bold text-base md:text-xl">Materias</h3>
                    <p className="text-gray-500 text-sm">Selecciona una para ver su detalle</p>
                </div>
                <div className="flex flex-col gap-1">
                    {subjectGroups.length > 0 ? (
                        subjectGroups.map(({ classId, subjectName, grades: subjectGrades }) => {
                            const isSelected = classId === selectedSubject?.classId;

                            return (
                                <button
                                    key={classId}
                                    onClick={() => setSelectedSubject({ classId, subjectName })}
                                    aria-pressed={isSelected}
                                    className={`flex cursor-pointer p-3 rounded-xl border justify-between items-center gap-3 transition-colors text-left
                                        ${isSelected ? 'bg-primary-shadow border-primary-darker/10' : 'border-transparent hover:bg-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm md:text-base capitalize text-custom-black truncate">
                                                {subjectName}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-custom-black shrink-0">
                                        {subjectGrades[0]?.grade}
                                    </p>
                                </button>
                            );
                        })
                    ) : (
                        <NoResults title="No hay resultados" />
                    )}
                </div>
            </div>

            <DayDetailPanel
                subjectName={selectedSubject?.subjectName ?? null}
                date={date}
                onDateChange={setDate}
                grades={selectedGrades}
            />

            {loadingAccumulated ? (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <LoadingContent title="" />
                </div>
            ) : (
                <AccumulatedPanel accumulated={accumulated} insight="El desempeño se mantiene estable. Revisa los comentarios de cada actividad para identificar el siguiente paso."/>
            )}
        </div>
    );
}