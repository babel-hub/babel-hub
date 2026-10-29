import { useCumulativeReports } from "../../../hooks/cumulative/useCumulativeReports.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { reverseName } from "../../../../types";
import { HiDocumentDownload, HiOutlineEye } from "react-icons/hi";
import { useDownloadPdf } from "../../../hooks/useDownlloadPdf.ts";


interface ReportsProps {
    courseId: string;
}

export function Reports({ courseId }: ReportsProps) {
    const { students, loading, error } = useCumulativeReports(courseId);
    const { download } = useDownloadPdf();

    if (loading) return <LoadingContent title="Cargando estudiantes..." />;
    if (error) return <NoResults title={error} />;
    if (!students || students.length === 0) {
        return <NoResults title="No hay estudiantes registrados en este curso" />;
    }

    const handleDownload = (studentId: string) => {
        download(
            `/api/cumulative/student/${studentId}/report-card/pdf`,
            `boletin-${studentId}.pdf`
        );
    };

    return (
        <div className="px-4 pb-2">
            <div className="mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">Boletines de Calificaciones</h2>
                <p className="text-sm text-gray-500">Visualiza o descarga el boletín de cada estudiante.</p>
            </div>

            <div className="relative overflow-x-auto no-scrollbar md:rounded-xl max-h-[calc(100dvh-17.8rem)] border border-gray-200">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-sm text-gray-700 bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th scope="col" className="p-2 sticky left-0 bg-gray-100 z-10 min-w-[250px]">
                            Estudiante
                        </th>
                        <th scope="col" className="p-2 text-center w-32">
                            Visualizar
                        </th>
                        <th scope="col" className="p-2 text-center w-32">
                            Descargar
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.map((student, index) => {
                        const fullName = reverseName({
                            middleName: student.middle_name,
                            firstName: student.first_name,
                            firstLastName: student.first_last_name,
                            secondLastName: student.second_last_name
                        });

                        return (
                            <tr
                                key={student.student_id}
                                className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === students.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <th scope="row" className="p-2 font-semibold text-custom-black whitespace-nowrap sticky left-0 bg-inherit capitalize">
                                    {fullName}
                                    <span className="block text-xs font-normal text-gray-500 mt-0.5">
                                        Matrícula: <span className="uppercase">{student.enrollment_code ? `${student.enrollment_code}` : 'Sin matrícula'}</span>
                                    </span>
                                </th>

                                {/* VIEW BUTTON */}
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

                                {/* DOWNLOAD BUTTON */}
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => handleDownload(student.student_id)}
                                        className="inline-flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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
        </div>
    );
}