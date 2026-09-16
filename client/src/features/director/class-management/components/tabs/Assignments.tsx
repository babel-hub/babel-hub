import { NoResults } from "../../../../../components/ui/blocks/NoResults.tsx";
import { useAssignmentOverview } from "../../hooks/assignments/useAssignmentOverview.ts";
import type { AssessmentCriteria, Assignment, GradeRecords, ModalModeTypes } from "../../../../../types";
import type { ClassDetailsData } from "../../types";
import { useState } from "react";
import { AssignmentFormModal } from "../ui/AssignmentFormModal.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { useAssignmentDelete } from "../../hooks/assignments/useAssignmentDelete.ts";
import { useBulkAssignments } from "../../hooks/assignments/useBulkAssignment.ts";
import { StudentGradeTable } from "../../../../../components/ui/table/StudentGradeTable.tsx";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";

interface AssignmentsProps {
    classData: ClassDetailsData;
    courseId: string;
    classId: string;
    periodId: string;
}

export function Assignments({ classData, classId, courseId, periodId }: AssignmentsProps) {
    const { assignmentsOverview, scale, loading, refetch } = useAssignmentOverview(
        courseId,
        classId,
        periodId,
        classData.students.length
    );

    const { loadingDelete, deleteAssignmentById } = useAssignmentDelete(refetch);
    const { bulkUpsertGrades } = useBulkAssignments(refetch);

    const [modalMode, setModalMode] = useState<ModalModeTypes>("none");
    const [assessmentId, setAssessmentId] = useState<string>("");
    const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

    if (loading || !scale) {
        return <LoadingContent title="Cargando asignaciones..." />;
    }

    if (!assignmentsOverview || assignmentsOverview.length === 0) {
        return (
            <div className="md:col-span-2 lg:col-span-3">
                <NoResults title="No hay criterios de evaluación configurados todavía"/>
            </div>
        );
    }

    const onAddAssignment = (assessment: AssessmentCriteria) => {
        setAssessmentId(assessment.id);
        setAssignmentToEdit(null);
        setModalMode("create");
    };

    const onEditAssignment = (assessment: AssessmentCriteria, assignment: Assignment) => {
        setAssessmentId(assessment.id);
        setAssignmentToEdit(assignment);
        setModalMode("edit");
    };

    const onDeleteAssignment = (assignment: Assignment) => {
        setAssignmentToDelete(assignment);
    };

    const handleSaveAssignmentGrades = async (assignmentId: string, records: GradeRecords[]) => {
        await bulkUpsertGrades(classId, assignmentId, records.map(r => ({
            studentId: r.studentId,
            value: r.value ?? scale.min_value,
            comment: r.comment ?? null
        })));
    };

    return (
        <div>
            {classData.students.length > 0 && assignmentsOverview.length > 0 ? (
                <StudentGradeTable
                    students={classData.students}
                    assessments={assignmentsOverview}
                    scale={{ min: scale.min_value, max: scale.max_value, passing: scale.passing_value }}
                    onAddAssignment={onAddAssignment}
                    onEditAssignment={onEditAssignment}
                    onDeleteAssignment={onDeleteAssignment}
                    onSaveAssignmentGrades={handleSaveAssignmentGrades}
                />
            ) : (
                <div className="md:col-span-2 border rounded-xl border-gray-100 lg:col-span-3">
                    <NoResults title="No hay estudiantes para evaluar"/>
                </div>
            )}

            <ConfirmModal
                isOpen={assignmentToDelete !== null}
                onClose={() => setAssignmentToDelete(null)}
                onConfirm={async () => {
                    if (assignmentToDelete) {
                        await deleteAssignmentById(assignmentToDelete.id);
                        setAssignmentToDelete(null);
                    }
                }}
                title="Eliminar asignación"
                message={`Se eliminará "${assignmentToDelete?.name}" y todas sus calificaciones. Esta acción no se puede deshacer.`}
                loadingDelete={loadingDelete}
            />

            {modalMode !== "none" && (
                <AssignmentFormModal
                    mode={modalMode}
                    periodId={periodId}
                    onClose={() => {
                        setAssignmentToEdit(null);
                        setModalMode("none");
                    }}
                    onSuccess={async () => {
                        setAssignmentToEdit(null);
                        setModalMode('none');
                        refetch();
                    }}
                    assignment={{ classId, assessmentId }}
                    assignmentToEdit={assignmentToEdit}
                />
            )}
        </div>
    )
}