import { useCumulativeReports } from "../../hooks/useCumulativeReports.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { HiDocumentDownload, HiOutlineEye } from "react-icons/hi";
import { useDownloadPdf } from "../../../global/hooks/useDownlloadPdf.ts";
import { ReportStat } from "../ui/ReportStat.tsx";
import { OtherAwards } from "../ui/OtherAwards.tsx";
import { ClipboardCheck, GraduationCap, CalendarCheck, ShieldCheck, Accessibility } from 'lucide-react';
import type { Student } from "../../../../features/types/types.ts";


interface ReportsProps {
    courseId: string;
    periodId: string;
    students: Student[];
}

export function Reports({ students, courseId, periodId }: ReportsProps) {
    const { loading, error, failStats, honorStudents } = useCumulativeReports(courseId, periodId);
    const { download } = useDownloadPdf();

    if (loading) return <LoadingContent title="Cargando estudiantes..." />;
    if (error) return <NoResults title={error} />;
    if (!students || students.length === 0) {
        return <NoResults title="No hay estudiantes registrados en este curso" />;
    }

    const handleDownload = (studentId: string, fileName: { name: string, lastName: string }) => {
        const slug = `${fileName.name}-${fileName.lastName}`
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');

        download(
            `/api/cumulative/student/${studentId}/report-card/pdf`,
            `boletin-${slug}.pdf`
        );
    };

    return (
        <div className="px-4 pb-2">
            <div className="mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">Boletines de Calificaciones</h2>
                <p className="text-sm text-gray-500">Visualiza o descarga el boletín de cada estudiante.</p>
            </div>

            <div className="relative overflow-x-auto max-h-[calc(100dvh-17.8rem)] no-scrollbar md:rounded-xl gap-3 grid grid-cols-6">
                <div className="md:rounded-xl border border-gray-200  col-span-3">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="p-2 sticky left-0 bg-gray-100 z-10 min-w-[250px]">
                                    Estudiante
                                </th>
                                <th scope="col" className="p-2 text-center w-32">
                                    Visualizar
                                </th>
                                <th scope="col" className="p-2 rounded-tr-xl text-center w-32">
                                    Descargar
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                        {students.map((student, index) => {
                            const fullName = reverseName({
                                middleName: student.student_middle_name,
                                firstName: student.student_first_name,
                                firstLastName: student.student_first_last_name,
                                secondLastName: student.student_second_last_name,
                            });

                            return (
                                <tr
                                    key={student.student_id}
                                    className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === students.length - 1 ? 'border-b-0' : ''}`}
                                >
                                    <th scope="row" className="p-2 font-semibold text-custom-black whitespace-nowrap sticky left-0 bg-inherit capitalize">
                                        {fullName}
                                        <span className="block text-xs font-normal text-gray-500 mt-0.5">
                                        <span className="uppercase">{student.email ? `${student.email}` : 'Sin matrícula'}</span>
                                    </span>
                                    </th>

                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => {}}
                                            className="inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                            title="Visualizar Boletín"
                                        >
                                            <HiOutlineEye className="size-4" />
                                            <span>Ver</span>
                                        </button>
                                    </td>

                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDownload(student.student_id, { name: student.student_first_name, lastName: student.student_first_last_name })}
                                            className="inline-flex items-center justify-center gap-1.5 bg-primary-shadow text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                            title="Descargar Boletín"
                                        >
                                            <HiDocumentDownload className="size-4" />
                                            <span>PDF</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="flex col-span-3 flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        {
                            failStats.map((failStat, i) => (
                                <ReportStat key={i} total={failStat.studentCount} remaining={i === 3 ? `+${failStat.failCount}` : `${failStat.failCount}`}/>
                            ))
                        }
                    </div>

                    <div className="border flex flex-col items-start gap-3 rounded-xl p-2 border-gray-200">
                        <div>
                            <span className="text-base lg:text-lg text-primary-darker font-semibold">Cuadro de honor</span>
                            <p className="text-xs text-gray-400">Certificados del periodo · 3 estudiantes destacados</p>
                        </div>

                        <div className="flex flex-col border-t border-gray-100 gap-0.5 w-full">
                            {
                                honorStudents.length > 0 ? (
                                    honorStudents.map((student) => {
                                        const fullName = reverseName({
                                            middleName: student.student_middle_name,
                                            firstName: student.student_first_name,
                                            firstLastName: student.student_first_last_name,
                                            secondLastName: student.student_second_last_name,
                                        });

                                        return (
                                            <div key={student.student_id} className="flex border-b py-2 border-gray-100 last:border-0 items-center gap-2">
                                        <span className="bg-primary-shadow text-primary font-bold py-0.5 px-2.5 rounded-md">
                                            {student.rank}
                                        </span>
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="text-bold capitalize">{fullName}</span>
                                                    <span className="text-xs text-gray-400">
                                                {student.rank === 1 ? "Mejor promedio" : student.rank === 2 ? "2.º lugar" : "3.º lugar"}
                                                        {` (${student.period_average.toFixed(2)})`}
                                            </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="w-full px-2 py-5 text-center">
                                        <p className="text-sm text-gray-400">No hay entudiantes de honor</p>
                                    </div>
                                )
                            }
                        </div>

                        <div>
                            <button
                                title="Descargar Honores"
                                className="inline-flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-primary-darker px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                type="button"
                            >
                                <HiDocumentDownload className="size-4" />
                                <span>Descargar certificados</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3">
                            <span className="text-base lg:text-lg text-primary-darker font-semibold">Otros reconocimientos</span>
                            <p className="text-xs text-gray-400">Destacamos el esfuerzo, la constancia y compromiso de nuestro estudientes</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 grid-rows-3">
                            <OtherAwards
                                title="Mejor en las Evaluaciones"
                                description="Reconocimiento al estudiante con el mejor desempeño en las evaluaciones."
                                icon={<ClipboardCheck className="size-8 text-primary" />}
                            />
                            <OtherAwards
                                title="Mejor por Asignatura"
                                description="Reconocimiento al estudiante con el mejor desempeño en una asignatura específica."
                                icon={<GraduationCap className="size-8 text-primary" />}
                            />
                            <OtherAwards
                                title="Mejor Asistencia"
                                description="Reconocimiento al estudiante con mayor porcentaje de asistencia durante el periodo."
                                icon={<CalendarCheck className="size-8 text-primary" />}
                            />
                            <OtherAwards
                                title="Mejor Convivencia"
                                description="Reconocimiento al estudiante que se destaca por su comportamiento, respeto y compañerismo."
                                icon={<ShieldCheck className="size-8 text-primary" />}
                            />
                            <OtherAwards
                                title="Esfuerzo y Superación"
                                description="Reconocimiento al estudiante que demuestra constancia, esfuerzo y mejora continua."
                                icon={<Accessibility className="size-8 text-primary" />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}