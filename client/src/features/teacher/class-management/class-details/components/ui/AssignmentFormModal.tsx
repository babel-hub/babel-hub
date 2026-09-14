import type { modeTypes } from "../../../../../types/types.ts";
import DynamicModalForm, { type FormField } from "../../../../../../components/ui/modals/ModalForm.tsx";
import React, { useState } from "react";
import { useCreateAssignment } from "../../hooks/assignments/useCreateAssignment.ts";
import type { Assignment } from "../../../../../../types";

interface AssignmentFormModalProps {
    mode: modeTypes;
    periodId: string;
    onClose: () => void;
    onSuccess: () => void;
    assignment: { classId: string; assessmentId: string };
    assignmentToEdit: Assignment | null;
}

export function AssignmentFormModal({ mode, onClose, periodId, onSuccess, assignmentToEdit, assignment }: AssignmentFormModalProps) {
    const isCreateMode = mode === "create";
    const [formData, setFormData] = useState({
        assignmentName: assignmentToEdit?.name || "",
        assignmentDueAt: assignmentToEdit?.due_date.slice(0,10) || "",
        classId: assignment.classId,
        assessmentId: assignment.assessmentId,
        periodId
    });

    const { loading, error, setError, upsertAssignment } = useCreateAssignment(onSuccess);

    const assignmentFields: FormField[] = [
        { name: "assignmentName", label: "Nombre de la asignación", type: "text", placeholder: "Ej. Actividad 1", required: true },
        { name: "assignmentDueAt", label: "Fecha de entrega", type: "date", placeholder: "", required: true }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.assignmentName.trim() || !formData.assignmentDueAt.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        const payload: Record<string, string> = {
            assignmentName: formData.assignmentName.trim().toLowerCase(),
            assignmentDueAt: formData.assignmentDueAt,
            periodId: formData.periodId
        }

        if (!assignmentToEdit) {
            payload.classId = formData.classId;
            payload.assessmentId = formData.assessmentId;
        }

        await upsertAssignment(mode, assignmentToEdit ? assignmentToEdit.id : null, payload);
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, name } = event.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? "Nueva asignación" : "Editar asignación"}
            fields={assignmentFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
        />
    );
}