import DynamicModalForm, {type FormField} from "../../../../../components/ui/modals/ModalForm.tsx";
import type { modeTypes } from "../../../../types/types.ts";
import React, { useState } from "react";
import type { Assessment } from "../../types";
import {useUpsertAssessment} from "../../hooks/assessment-criteria/useUpserAssessment.ts";

interface AssessmentFormModalProps {
    mode: modeTypes;
    assessment: Assessment | null;
    assessmentInfo: { id: string, name: string };
    onSuccess: () => void;
    onClose: () => void;
}

const FORM_REGEXP = {
    name: /^(?=.*[a-zA-Z])[a-zA-ZÀ-ÿ\s´\.,]+$/
}

export function AssessmentFormModal({ mode, assessmentInfo, assessment, onClose, onSuccess }: AssessmentFormModalProps) {
    const isCreateMode = mode === "create";
    const [formModal, setFormModal] = useState({
        name: assessment?.name || "",
        weight: assessment?.weight || 0,
        gradingTemplateId: assessmentInfo.id
    })

    const { loading, upsertAssessment, error, setError } = useUpsertAssessment(onSuccess);

    const gradingFields: FormField[] = [
        { name: "name", label: "Nombre del Criterio de Evaluacion", type: "text", placeholder: "Ej. Actividades", required: true },
        { name: "weight", label: "Porcentaje", type: "number", placeholder: "Ej. 70", required: true }
    ]

    const handleUpsertAssessment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formModal.gradingTemplateId) {
            setError("No se pudo determinar el template de calificación");
            return;
        }

        if (!FORM_REGEXP.name.test(formModal.name) || !formModal.name.trim()) {
            setError("El nombre del criterio de evaluacion debe contener solo letras");
            return;
        }

        const weightValue = Number(formModal.weight);

        if (Number.isNaN(weightValue) || weightValue < 0 || weightValue > 100) {
            setError("El porcentaje solo puede contener numeros del 0 al 100");
            return;
        }

        const payload = {
            name: formModal.name,
            weight: weightValue,
            gradingTemplateId: formModal.gradingTemplateId
        }

        await upsertAssessment(mode, assessment ? assessment.id : null, payload);
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormModal({...formModal, [name]: value});
        setError("");
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? `Añadir Criterio de Evaluacion` : `Editar Criterio de Evaluacion`}
            fields={gradingFields}
            formData={formModal}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleFormChange}
            onSubmit={handleUpsertAssessment}
        />
    )
}