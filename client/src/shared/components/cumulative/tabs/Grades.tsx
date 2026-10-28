import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { useCumulativeGrades } from "../../../hooks/cumulative/useCumulativeGrades.ts";
import { useScales } from "../../../hooks/useScales.ts";
import { toneBgandText } from "../../../../utils/utils.ts";
import { CustomSelect } from "../../../../components/ui/selector/CustomSelect.tsx";
import { useEffect, useState, useRef, useMemo } from "react";
import { IoFilter } from "react-icons/io5";
import { HiChevronUpDown } from "react-icons/hi2";
import { CourseRadarChart } from "../ui/CourseRadarChart.tsx";

interface GradesProps {
    courseId: string;
    periodId: string;
}

const opt = [
    { label: "Tabla de notas", value: "table" },
    { label: "Gráfico de radar", value: "radar" }
];

type SortConfig = {
    subjectIndex: number;
    direction: "asc" | "desc";
} | null;

export function Grades({ courseId, periodId }: GradesProps) {
    const { scales } = useScales();
    const filterRef = useRef<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const { grades, loading } = useCumulativeGrades(courseId, periodId);

    const [showTones, setShowTones] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<string>("table");

    const [openFilterIndex, setOpenFilterIndex] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (filterRef.current && !filterRef.current.contains(target)) {
                setShowFilters(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setOpenFilterIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedGrades = useMemo(() => {
        if (!grades || !sortConfig) return grades;

        return [...grades].sort((a, b) => {
            const subjectName = grades[0]?.subjects?.[sortConfig.subjectIndex]?.subject_name;
            if (!subjectName) return 0;

            const gradeA = a.subjects?.find(s => s.subject_name === subjectName)?.final_grade ?? -1;
            const gradeB = b.subjects?.find(s => s.subject_name === subjectName)?.final_grade ?? -1;

            if (gradeA === -1 && gradeB !== -1) return 1;
            if (gradeB === -1 && gradeA !== -1) return -1;

            if (sortConfig.direction === "asc") {
                return gradeA - gradeB;
            } else {
                return gradeB - gradeA;
            }
        });
    }, [grades, sortConfig]);

    if (loading) return <LoadingContent title="" />;
    if (!grades || grades.length === 0) return <NoResults title="No hay calificaciones registradas para este curso en este periodo"/>;
    if (!scales || scales.length === 0) return <NoResults title="No hay escalas registradas"/>;

    const subjectHeaders = grades[0]?.subjects?.map(s => s.subject_name) || [];
    const scalesById = new Map(scales.map(s => [s.id, s]));

    const handleSort = (index: number, direction: "asc" | "desc") => {
        setSortConfig({ subjectIndex: index, direction });
        setOpenFilterIndex(null);
    };

    return (
        <div className="px-4 pb-2 h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">Calificaciones por Asignatura</h2>
                <p className="text-sm text-gray-500">Analiza el desempeño académico por materia, filtra las notas y observa el rendimiento general.</p>
            </div>

            <div className="w-full flex gap-2 items-center justify-between mb-3 shrink-0">
                <div className="w-full max-w-xs">
                    <CustomSelect
                        options={opt}
                        value={viewMode}
                        onChange={(val) => setViewMode(val as string)}
                    />
                </div>

                {viewMode === "table" && (
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="border rounded-full cursor-pointer hover:bg-gray-100 text-gray-600 border-gray-200 p-2"
                        >
                            <IoFilter className="size-5" />
                        </button>

                        <div className={`
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
                                <th key={index} scope="col" className="p-2 capitalize text-center relative">
                                    <div className="flex items-end justify-center gap-1">
                                        {subjectName.slice(0, 3)}
                                        <button
                                            type="button"
                                            className={`hover:cursor-pointer rounded-md ${openFilterIndex === index ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                                            onClick={() => setOpenFilterIndex(openFilterIndex === index ? null : index)}
                                        >
                                            <HiChevronUpDown className="size-4" />
                                        </button>
                                    </div>

                                    {openFilterIndex === index && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute top-full mt-1 w-36 left-1/2 -translate-x-1/2 rounded-xl bg-white z-20 border border-gray-100 p-1 flex flex-col gap-1 shadow"
                                        >
                                            <button
                                                onClick={() => handleSort(index, "desc")}
                                                className="text-sm font-normal text-left px-3 py-2 w-full hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                Mayor a Menor
                                            </button>
                                            <button
                                                onClick={() => handleSort(index, "asc")}
                                                className="text-sm font-normal text-left px-3 py-2 w-full hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                Menor a Mayor
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSortConfig(null);
                                                    setOpenFilterIndex(null);
                                                }}
                                                className="text-sm font-normal text-left px-3 py-2 w-full hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                            >
                                                Limpiar filtro
                                            </button>
                                        </div>
                                    )}
                                </th>
                            ))}

                            <th scope="col" className="p-2 text-center bg-primary-darker text-white font-bold sticky right-0 z-20">
                                Promedio
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedGrades?.map((student, index) => {
                            const fullName = reverseName({
                                middleName: student.student_middle_name,
                                firstName: student.student_first_name,
                                firstLastName: student.student_first_last_name,
                                secondLastName: student.student_second_last_name
                            });

                            return (
                                <tr
                                    key={student.student_id}
                                    className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === sortedGrades.length - 1 ? 'border-b-0' : ''}`}
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