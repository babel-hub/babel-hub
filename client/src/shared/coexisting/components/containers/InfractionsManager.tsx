import { useState } from "react";
import { type ModalModeTypes, reverseName } from "../../../../types";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { InfractionsMonitoringTabs } from "../ui/InfractionsMonitoringTabs.tsx";
import { ConfirmModal } from "../../../../components/ui/modals/ConfirmModal.tsx";
import { EscalateInfractionModal } from "../ui/EscalateInfractionModal.tsx";
import { UpsertInfractionModal } from "../ui/UpsertInfractionModal.tsx";
import { useDeleteInfraction } from "../../hooks/useDeleteInfraction.ts";
import type { Student } from "../../../../features/types/types.ts";
import type { StudentInfraction, StudentMonitoring } from "../../types/types.ts";
import { useRepeatInfraction } from "../../hooks/useRepeatInfraction.ts";
import { usePublishInfraction } from "../../../cumulative/hooks/usePublishInfraction.ts";

type Tab = "infractions" | "monitoring";

interface InfractionsManagerProps {
    students: Student[];
    selectedStudentId: string;
    setSelectedStudentId: (id: string) => void;
    selectedStudent: Student | undefined;

    infractions: StudentInfraction[];
    monitoring: StudentMonitoring[];
    loadingInfractions: boolean;
    loadingMonitoring: boolean;
    errorInfractions: string;
    errorMonitoring: string;

    classId?: string;
    courseId: string;

    refetch: () => void;

    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canEscalate?: boolean;
    canPublish?: boolean;
}

export function InfractionsManager({
                                       students, selectedStudentId, setSelectedStudentId, selectedStudent,
                                       infractions, monitoring,
                                       loadingInfractions, loadingMonitoring, errorInfractions, errorMonitoring,
                                       classId, courseId,
                                       refetch,
                                       canCreate = false, canEdit = false, canDelete = false, canEscalate = false, canPublish = false
                                   }: InfractionsManagerProps) {
    const [tab, setTab] = useState<Tab>("infractions");
    const [modalMode, setModalMode] = useState<ModalModeTypes>("none");
    const [infractionToEdit, setInfractionToEdit] = useState<StudentInfraction | null>(null);
    const [infractionToDelete, setInfractionToDelete] = useState<StudentInfraction | null>(null);
    const [infractionToEscalate, setInfractionToEscalate] = useState<StudentInfraction | null>(null);

    const { loading: loadingDelete, deleteInfractionById } = useDeleteInfraction(refetch);
    const { repeatInfraction } = useRepeatInfraction(refetch);
    const { togglePublish } = usePublishInfraction(refetch);

    const openCreate = () => { setInfractionToEdit(null); setModalMode("create"); };
    const openEdit = (inf: StudentInfraction) => { setInfractionToEdit(inf); setModalMode("edit"); };

    const handleDelete = async () => {
        if (!infractionToDelete) return;
        await deleteInfractionById(infractionToDelete.id);
        setInfractionToDelete(null);
    };

    const handlePublish = async (infraction: StudentInfraction) => {
        await togglePublish(infraction.id, !infraction.published_to_guardian);
    };

    const onRepeatInfraction = async (infraction: StudentInfraction) => {
        const payload = {
            codeId: infraction.infraction_code_id,
            studentId: infraction.student_id,
            description: infraction.description,
            locationContext: infraction.location_context,
            courseId,
            escalate: false,
            classId: classId ?? null,
        }

        await repeatInfraction(payload);
    };

    return (
        <div className="w-full h-auto grid grid-cols-2">
            <div className="bg-white h-full max-h-[calc(100dvh-10.9rem)] overflow-y-auto styled-scrollbar">
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
                                            secondLastName: student.student_second_last_name,
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
                        <button type="button" onClick={() => setTab("infractions")}
                                className={`py-2 px-5 font-medium rounded-l-xl cursor-pointer text-sm transition-colors ${
                                    tab === "infractions" ? "bg-primary-darker text-white" : "bg-primary-shadow text-primary"
                                }`}>
                            Faltas
                        </button>
                        <button type="button" onClick={() => setTab("monitoring")}
                                className={`py-2 px-5 font-medium cursor-pointer rounded-r-xl text-sm transition-colors ${
                                    tab === "monitoring" ? "bg-primary-darker text-white" : "bg-primary-shadow text-primary"
                                }`}>
                            Seguimientos
                        </button>
                    </div>

                    {canCreate && selectedStudentId && tab === "infractions" && (
                        <button onClick={openCreate}
                                className="ml-auto px-3 py-1.5 text-sm bg-primary-darker cursor-pointer text-white rounded-xl font-medium transition-colors">
                            + Nueva falta
                        </button>
                    )}
                </div>

                <InfractionsMonitoringTabs
                    selectedStudentId={selectedStudentId}
                    selectedStudent={selectedStudent}
                    classId={classId}
                    tab={tab}
                    infractions={infractions}
                    monitoring={monitoring}
                    loadingInfractions={loadingInfractions}
                    loadingMonitoring={loadingMonitoring}
                    errorInfractions={errorInfractions}
                    errorMonitoring={errorMonitoring}
                    onEdit={canEdit ? openEdit : undefined}
                    onDelete={canDelete ? (inf) => setInfractionToDelete(inf) : undefined}
                    onEscalate={canEscalate ? (inf) => setInfractionToEscalate(inf) : undefined}
                    onPublish={canPublish ? (inf) => handlePublish(inf) : undefined}
                    onRepeat={canCreate ? onRepeatInfraction : undefined}
                />
            </div>

            <ConfirmModal
                isOpen={infractionToDelete !== null}
                onClose={() => setInfractionToDelete(null)}
                title="¿Estás seguro?"
                message="¿Estás seguro que quieres eliminar esta infracción?"
                onConfirm={handleDelete}
                loadingDelete={loadingDelete}
            />

            {infractionToEscalate && (
                <EscalateInfractionModal
                    courseId={courseId}
                    studentInfraction={infractionToEscalate}
                    onClose={() => setInfractionToEscalate(null)}
                    onSuccess={() => {
                        setInfractionToEscalate(null);
                        refetch();
                    }}
                />
            )}

            {modalMode !== "none" && selectedStudent && (
                <UpsertInfractionModal
                    classId={classId ? classId : null}
                    courseId={courseId}
                    studentId={selectedStudent.student_id}
                    mode={modalMode}
                    infraction={infractionToEdit}
                    onClose={() => { setModalMode("none"); setInfractionToEdit(null); }}
                    onSuccess={() => {
                        setModalMode("none");
                        setInfractionToEdit(null);
                        refetch();
                    }}
                />
            )}
        </div>
    );
}