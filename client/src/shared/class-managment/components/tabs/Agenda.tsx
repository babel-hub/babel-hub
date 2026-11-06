import { useState } from "react";
import { type ModalModeTypes, reverseName } from "../../../../types";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import type { Student, StudentInfraction } from "../../../../features/types/types.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { HiPencil } from "react-icons/hi";
import { useInfractionsData } from "../../hooks/coexistence/useInfractionsData.ts";
import { useMonitoringData } from "../../hooks/coexistence/useMonitoringData.ts";
import { CreateInfractionModal } from "../ui/CreateInfractionModal.tsx";


interface AgendaProps {
    students: Student[];
    classId: string;
    courseId: string;
}

type Tabs = "infractions" | "monitoring";

const SEVERITY_STYLES: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
};

export function Agenda({ students, classId, courseId }: AgendaProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [tab, setTab] = useState<Tabs>("infractions");
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [infractionToEdit, setInfractionToEdit] = useState<StudentInfraction | null>(null);

    const { infractions, loading: loadingInfractions, error: errorInfractions, refetch } =
        useInfractionsData(classId, selectedStudentId);

    const { monitoring, loading: loadingMonitoring, error: errorMonitoring, refetch: refetchMonitoring } =
        useMonitoringData(
            tab === "monitoring" ? courseId : "",
            tab === "monitoring" ? selectedStudentId : ""
        );

    const selectedStudent = students.find(s => s.student_id === selectedStudentId);

    const openCreateModal = () => {
        setInfractionToEdit(null);
        setModalMode("create");
    };

    const openEditModal = (inf: StudentInfraction) => {
        setInfractionToEdit(inf);
        setModalMode("edit");
    };

    return (
        <div className="w-full h-auto grid grid-cols-2 border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-white h-full max-h-[calc(100dvh-10.8rem)] overflow-y-auto styled-scrollbar border-r border-gray-100">
                {students.length > 0 ? (
                    <ul className="divide-y divide-gray-50">
                        {students.map((student) => (
                            <li
                                key={student.student_id}
                                onClick={() => setSelectedStudentId(student.student_id)}
                                className={`py-3 px-5 flex items-center gap-4 cursor-pointer transition-colors ${
                                    selectedStudentId === student.student_id
                                        ? "bg-primary-shadow"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full uppercase flex items-center justify-center text-sm font-bold shrink-0
                                                 ${selectedStudentId === student.student_id ? "bg-primary-darker text-white" : "bg-primary-shadow text-primary-darker"}`}>
                                    {`${student.student_first_name.charAt(0)}${student.student_first_last_name.charAt(0)}`}
                                </div>
                                <div>
                                    <span className="block text-sm md:text-base capitalize font-medium text-custom-black">
                                        {reverseName({
                                            firstName: student.student_first_name,
                                            middleName: student.student_middle_name,
                                            firstLastName: student.student_first_last_name,
                                            secondLastName: student.student_second_last_name
                                        })}
                                    </span>
                                    <span className="block text-sm text-gray-500">{student.email}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <NoResults title="No hay estudiantes en este curso" />
                )}
            </div>

            <div className="w-full bg-white flex flex-col">
                <div className="w-full flex border-b border-gray-100">
                    <button
                        type="button"
                        onClick={() => setTab("infractions")}
                        className={`py-2 px-5 font-medium text-sm transition-colors ${
                            tab === "infractions"
                                ? "bg-primary text-white"
                                : "bg-white text-primary hover:bg-gray-50"
                        }`}
                    >
                        Infracciones
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("monitoring")}
                        className={`py-2 px-5 font-medium text-sm transition-colors ${
                            tab === "monitoring"
                                ? "bg-primary text-white"
                                : "bg-white text-primary hover:bg-gray-50"
                        }`}
                    >
                        Monitoreo
                    </button>

                    {selectedStudentId && tab === "infractions" && (
                        <button
                            onClick={() => openCreateModal()}
                            className="ml-auto mr-2 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors"
                        >
                            + Nueva infracción
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto styled-scrollbar max-h-[calc(100dvh-12.8rem)] p-4">
                    {!selectedStudentId ? (
                        <NoResults title="Selecciona un estudiante para ver su historial" />
                    ) : tab === "infractions" ? (
                        <>
                            {loadingInfractions && <LoadingContent title="" />}
                            {errorInfractions && <NoResults title={errorInfractions} />}
                            {!loadingInfractions && !errorInfractions && infractions.length === 0 && (
                                <NoResults title={`${selectedStudent?.student_first_name ?? "Este estudiante"} no tiene infracciones registradas`} />
                            )}
                            {!loadingInfractions && infractions.length > 0 && (
                                <ul className="flex flex-col gap-3">
                                    {infractions.map((inf) => (
                                        <li key={inf.id} className="border border-gray-100 rounded-xl p-3">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="font-semibold text-sm capitalize text-custom-black">
                                                    {inf.infraction_name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${SEVERITY_STYLES[inf.severity] ?? SEVERITY_STYLES.low}`}>
                                                        {inf.severity === "high" ? "Grave" : inf.severity === "medium" ? "Media" : "Leve"}
                                                    </span>
                                                    <button
                                                        onClick={() => openEditModal(inf)}
                                                        className="text-gray-400 hover:text-primary p-1 rounded"
                                                        title="Editar"
                                                    >
                                                        <HiPencil className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {inf.description && (
                                                <p className="text-sm text-gray-600 mb-2">{inf.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                Reportado por <span className="font-medium capitalize">{inf.reported_by_name}</span>
                                                {" · "}
                                                {new Date(inf.created_at).toLocaleDateString("es-CO", {
                                                    day: "2-digit", month: "short", year: "numeric"
                                                })}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <>
                            {loadingMonitoring && <LoadingContent title="" />}
                            {errorMonitoring && <NoResults title={errorMonitoring} />}
                            {!loadingMonitoring && !errorMonitoring && monitoring.length === 0 && (
                                <NoResults title={`${selectedStudent?.student_first_name ?? "Este estudiante"} no tiene monitoreos activos`} />
                            )}
                            {!loadingMonitoring && monitoring.length > 0 && (
                                <ul className="flex flex-col gap-3">
                                    {monitoring.map((m) => (
                                        <li key={m.id} className="border border-gray-100 rounded-xl p-3">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="font-semibold text-sm capitalize text-custom-black">
                                                    {m.infraction_name}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${SEVERITY_STYLES[m.severity] ?? SEVERITY_STYLES.low}`}>
                                                    {m.severity === "high" ? "Grave" : m.severity === "medium" ? "Media" : "Leve"}
                                                </span>
                                            </div>
                                            {m.notes && (
                                                <p className="text-sm text-gray-600 mb-2">{m.notes}</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                En <span className="font-medium capitalize">{m.course_name}</span>
                                                {" · "}
                                                Reportado por <span className="font-medium capitalize">{m.reported_by_name}</span>
                                                {" · "}
                                                {new Date(m.created_at).toLocaleDateString("es-CO", {
                                                    day: "2-digit", month: "short", year: "numeric"
                                                })}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </div>

            {modalMode !== "none" && selectedStudent && (
                <CreateInfractionModal
                    classId={classId}
                    studentId={selectedStudent.student_id}
                    onClose={() => setModalMode("none")}
                    onSuccess={() => {
                        setModalMode("none");
                        refetch();
                        refetchMonitoring();
                    }}
                    mode={modalMode}
                    infraction={infractionToEdit}
                />
            )}
        </div>
    );
}