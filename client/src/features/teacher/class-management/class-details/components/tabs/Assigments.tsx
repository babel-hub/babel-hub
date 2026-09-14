import type { ClassDetailsData } from "../../types";
import { NoResults } from "../../../../../../components/ui/blocks/NoResults.tsx";
import { StudentGradeTable } from "../../../../../../components/ui/table/StudentGradeTable.tsx";
import { ConfirmModal } from "../../../../../../components/ui/modals/ConfirmModal.tsx";
import {useEffect, useState} from "react";
import type { AssessmentCriteria, Assignment, GradeRecords, ModalModeTypes } from "../../../../../../types";
import { useAssignmentOverview } from "../../hooks/assignments/useAssignmentOverview.ts";
import { useClassScale } from "../../hooks/assignments/useClassScale.ts";
import { useAssignmentDelete } from "../../hooks/assignments/useAssignmentDelete.ts";
import { useBulkAssignments } from "../../hooks/assignments/useBulkAssignments.ts";
import {AssignmentFormModal} from "../ui/AssignmentFormModal.tsx";
import {usePeriods} from "../../../../../../shared/hooks/usePeriods.ts";

interface AssignmentsProps {
    classData: ClassDetailsData;
    classId: string;
    courseId: string;
}

export function Assignments({ classData, courseId, classId }: AssignmentsProps) {
    const { periods } = usePeriods();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    const { assignmentsOverview, loading, refetch } = useAssignmentOverview(courseId, classId, selectedPeriodId, classData.students);
    const { scale, loadingScale } = useClassScale(classId);
    const { loadingDelete, deleteAssignmentById } = useAssignmentDelete(refetch);
    const { bulkUpsertGrades } = useBulkAssignments(refetch);

    const [modalMode, setModalMode] = useState<ModalModeTypes>("none");
    const [assessmentId, setAssessmentId] = useState<string>("");
    const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

    useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            const activePeriod = periods.find(p => p.is_current);
            setSelectedPeriodId(activePeriod ? activePeriod.id : periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    if (!periods || periods.length === 0) return <NoResults title="No se encontraron periodos" />;

    if (!selectedPeriodId) return null;

    if (loading || loadingScale || !scale) return null;

    if (!assignmentsOverview || assignmentsOverview.length === 0) {
        return (
            <div className="md:col-span-2 lg:col-span-3">
                <NoResults title="No hay criterios de evaluación configurados o no tienes estudiantes"/>
            </div>
        );
    }

    const selectedPeriod = periods.find(p => p.id === selectedPeriodId) || periods[0];

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
            <div className="flex items-center justify-end p-2 w-full">
                <select
                    name="teacher_periods_assignments"
                    className="bg-white text-sm capitalize appearance-none text-custom-black border border-gray-200 rounded-xl md:px-4 p-2 md:py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                    value={selectedPeriod?.id || ""}
                    disabled={classData.students.length === 0}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                >
                    {periods?.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

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
                    periodId={selectedPeriodId}
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