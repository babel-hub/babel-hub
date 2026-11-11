import { useState } from "react";
import { type ModalModeTypes, reverseName } from "../../../../types";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import type { Student } from "../../../../features/types/types.ts";
import { useInfractionsData } from "../../../coexisting/hooks/useInfractionsData.ts";
import { useMonitoringData } from "../../../coexisting/hooks/useMonitoringData.ts";
import { UpsertInfractionModal } from "../../../coexisting/components/ui/UpsertInfractionModal.tsx";
import { InfractionsMonitoringTabs } from "../../../coexisting/components/ui/InfractionsMonitoringTabs.tsx";
import { useDeleteInfraction } from "../../../coexisting/hooks/useDeleteInfraction.ts";
import { ConfirmModal } from "../../../../components/ui/modals/ConfirmModal.tsx";
import { useRepeatInfraction } from "../../../coexisting/hooks/useRepeatInfraction.ts";
import { EscalateInfractionModal } from "../../../coexisting/components/ui/EscalateInfractionModal.tsx";
import type { StudentInfraction, Tabs } from "../../../coexisting/types/types.ts";

interface AgendaProps {
    students: Student[];
    classId: string;
    courseId: string;
}

export function Agenda({ students, classId, courseId }: AgendaProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [tab, setTab] = useState<Tabs>("infractions");
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [infractionToEdit, setInfractionToEdit] = useState<StudentInfraction | null>(null);
    const [infractionToDelete, setInfractionToDelete] = useState<StudentInfraction | null>(null);
    const [infractionToEscalate, setInfractionToEscalate] = useState<StudentInfraction | null>(null);

    const { infractions, loading: loadingInfractions, error: errorInfractions, refetch } =
        useInfractionsData(classId, selectedStudentId);

    const { monitoring, loading: loadingMonitoring, error: errorMonitoring, refetch: refetchMonitoring } =
        useMonitoringData(
            tab === "monitoring" ? courseId : "",
            tab === "monitoring" ? selectedStudentId : ""
        );
    const { deleteInfractionById, loading: loadingDelete } = useDeleteInfraction(refetch);
    const { repeatInfraction } = useRepeatInfraction(refetch);

    const selectedStudent = students.find(s => s.student_id === selectedStudentId);

    const openCreateModal = () => {
        setInfractionToEdit(null);
        setModalMode("create");
    };

    const openEditModal = (inf: StudentInfraction) => {
        setInfractionToEdit(inf);
        setModalMode("edit");
    };

    const onRepeatInfraction = async (infraction: StudentInfraction) => {
        const payload = {
            codeId: infraction.infraction_code_id,
            studentId: infraction.student_id,
            description: infraction.description,
            escalate: false
        }

        await repeatInfraction(classId, payload);
    };

    const onEscalateInfraction = (infraction: StudentInfraction) => {
        setInfractionToEscalate(infraction);
    }

    return (
        <div className="w-full h-auto grid grid-cols-2 border border-gray-100">
            <div className="bg-white h-full max-h-[calc(100dvh-10.9rem)] overflow-y-auto styled-scrollbar border-r border-gray-100">
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

            <div className="w-full bg-white h-full max-h-[calc(100dvh-10.9rem)] overflow-y-auto p-5 flex flex-col">
                <div className="w-full flex">
                    <div className="border border-gray-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setTab("infractions")}
                            className={`py-2 px-5 font-medium rounded-l-xl  cursor-pointer text-sm transition-colors ${
                                tab === "infractions"
                                    ? selectedStudentId ? "bg-primary-darker text-white" : "bg-primary text-white"
                                    : "bg-primary-shadow text-primary"
                            }`}
                        >
                            Infracciones
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("monitoring")}
                            className={`py-2 px-5 font-medium cursor-pointer rounded-r-xl text-sm transition-colors ${
                                tab === "monitoring"
                                    ? selectedStudentId ? "bg-primary-darker text-white" : "bg-primary text-white"
                                    : "bg-primary-shadow text-primary"
                            }`}
                        >
                            Monitoreo
                        </button>
                    </div>

                    {selectedStudentId && tab === "infractions" && (
                        <button
                            onClick={() => openCreateModal()}
                            className="ml-auto px-3 py-1.5 text-sm bg-primary-darker cursor-pointer text-white rounded-xl font-medium transition-colors"
                        >
                            + Nueva infracción
                        </button>
                    )}
                </div>

                <InfractionsMonitoringTabs
                    selectedStudentId={selectedStudentId}
                    selectedStudent={selectedStudent}
                    tab={tab}
                    infractions={infractions}
                    monitoring={monitoring}
                    loadingInfractions={loadingInfractions}
                    loadingMonitoring={loadingMonitoring}
                    errorInfractions={errorInfractions}
                    errorMonitoring={errorMonitoring}
                    onEdit={(inf) => openEditModal(inf)}
                    onDelete={(inf) => setInfractionToDelete(inf)}
                    onRepeat={(inf) => onRepeatInfraction(inf)}
                    onEscalate={(inf) => onEscalateInfraction(inf)}
                />
            </div>

            <ConfirmModal
                isOpen={infractionToDelete !== null}
                onClose={() => setInfractionToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Estas seguro que quieres eliminar esta infracción?`}
                onConfirm={async () => {
                    if (infractionToDelete) {
                        await deleteInfractionById(infractionToDelete.id);
                        setInfractionToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

        {infractionToEscalate && (
                <EscalateInfractionModal
                    courseId={courseId}
                    studentInfraction={infractionToEscalate}
                    onClose={() => setInfractionToEscalate(null)}
                    onSuccess={() => {
                        setInfractionToEscalate(null);
                    }}
                />
            )}

            {modalMode !== "none" && selectedStudent && (
                <UpsertInfractionModal
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