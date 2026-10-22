import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { useCumulativeGrades } from "../../../hooks/cumulative/useCumulativeGrades.ts";
import { useScales } from "../../../hooks/useScales.ts";
import { toneBgandText } from "../../../../utils/utils.ts";
import { CustomSelect } from "../../../../components/ui/selector/CustomSelect.tsx";
import { useEffect, useState, useRef } from "react";
import { IoFilter } from "react-icons/io5";
import { CourseRadarChart } from "../ui/CourseRadarChart.tsx";

interface GradesProps {
    courseId: string;
    periodId: string;
}

const opt = [
    { label: "Tabla de notas", value: "table" },
    { label: "Gráfico de radar", value: "radar" }
];

export function Grades({ courseId, periodId }: GradesProps) {
    const { scales } = useScales();
    const filterRef = useRef<HTMLDivElement | null>(null);
    const { grades, loading } = useCumulativeGrades(courseId, periodId);

    const [showTones, setShowTones] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>("table"); // <-- New state

    useEffect(() => {
        const onClickFilter = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', onClickFilter);
        return () => document.removeEventListener('mousedown', onClickFilter);
    }, []);

    if (loading) return <LoadingContent title="" />;
    if (!grades || grades.length === 0) return <NoResults title="No hay calificaciones registradas para este curso en este periodo"/>;
    if (!scales || scales.length === 0) return <NoResults title="No hay escalas registradas"/>;

    const subjectHeaders = grades[0]?.subjects?.map(s => s.subject_name) || [];
    const scalesById = new Map(scales.map(s => [s.id, s]));

    return (
        <div className="px-4 pb-2 h-full flex flex-col">
            <div className="w-full flex gap-2 items-center justify-between mb-3 shrink-0">
                <div className="w-full max-w-xs">
                    <CustomSelect
                        options={opt}
                        value={viewMode}
                        onChange={(val) => setViewMode(val as string)}
                    />
                </div>

                {viewMode === "table" && (
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="border rounded-full cursor-pointer hover:bg-gray-100 text-gray-600 border-gray-200 p-2"
                        >
                            <IoFilter className="size-5" />
                        </button>

                        <div ref={filterRef} className={`
                            ${showFilters ? "" : "hidden"}
                            absolute top-full z-30 border border-gray-200 right-0 w-58 bg-white rounded-xl shadow p-2
                        `}>
                            <div className="flex justify-between items center">
                                <p className="text-custom-black text-sm">Mapa de color</p>
                                <div className="container-toggle">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        id="checkbox"
                                        checked={showTones}
                                        onChange={(e) => setShowTones(e.target.checked)}
                                    />
                                    <label className="switch" htmlFor="checkbox">
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {viewMode === "radar" ? (
                <div className="flex-1 max-h-[calc(100dvh-17rem)] md:rounded-xl bg-white">
                    <CourseRadarChart grades={grades} scalesById={scalesById} />
                </div>
            ) : (
                <div className="relative min-w-md overflow-x-auto no-scrollbar md:rounded-xl border border-gray-200 flex-1">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="p-2 sticky left-0 bg-gray-100 z-20 min-w-3xs">
                                    Estudiante
                                </th>

                                {subjectHeaders.map((subjectName, index) => (
                                    <th key={index} scope="col" className="p-2 capitalize text-center">
                                        {subjectName.slice(0, 3)}
                                    </th>
                                ))}

                                <th scope="col" className="p-2 text-center bg-primary-darker text-white font-bold sticky right-0 z-20">
                                    Promedio
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        {grades.map((student, index) => {
                            const fullName = reverseName({
                                middleName: student.student_middle_name,
                                firstName: student.student_first_name,
                                firstLastName: student.student_first_last_name,
                                secondLastName: student.student_second_last_name
                            });

                            return (
                                <tr
                                    key={student.student_id}
                                    className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === grades.length - 1 ? 'border-b-0' : ''}`}
                                >
                                    <th scope="row" className="px-2 py-3 font-semibold text-custom-black whitespace-nowrap sticky left-0 z-10 bg-inherit capitalize">
                                        {fullName}
                                    </th>

                                    {(student.subjects ?? []).map((subject) => {
                                        const subjectScale = scalesById.get(subject.scale_id);

                                        const toneClass =
                                            showTones && subjectScale
                                                ? toneBgandText(subject.final_grade, {
                                                    min: subjectScale.min_value,
                                                    max: subjectScale.max_value,
                                                    passing: subjectScale.passing_value,
                                                })
                                                : "text-gray-700";

                                        return (
                                            <td key={subject.class_id} className="px-0.5 py-0.5 text-center">
                                                {subject.final_grade > 0 ? (
                                                    <span className={`${toneClass} px-2 py-2.5 rounded-md`}>
                                                        {subject.final_grade.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-center font-bold text-primary border-l border-gray-200 bg-white sticky right-0 z-10 shadow-[-1px_0_0_0_#e5e7eb]">
                                        {student.period_average}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}