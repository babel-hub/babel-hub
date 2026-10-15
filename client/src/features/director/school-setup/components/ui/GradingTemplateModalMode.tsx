import type { GradingTemplate } from "../../types";
import DynamicModalForm, { type FormField } from "../../../../../components/ui/modals/ModalForm.tsx";
import { useState } from "react";
import { useUpsertGradingTemplate } from "../../hooks/grading-templates/useUpsertGradingTemplate.ts";
import type { modeTypes } from "../../../../types/types.ts";
import { useScales } from "../../../../../shared/hooks/useScales.ts";
import type { Scale } from "../../../../../shared/types/types.ts";

interface GradingTemplateModalModeProps {
    mode: modeTypes;
    gradingTemplate: GradingTemplate | null;
    gradingTemplateId: string | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function GradingTemplateModalMode({ mode, gradingTemplate, onCancel, gradingTemplateId, onSuccess }: GradingTemplateModalModeProps) {
    const isCreateMode = mode === "create";
    const { scales } = useScales();
    const { loading, upsertGradingTemplate, error, setError } = useUpsertGradingTemplate(onSuccess);
    const [formData, setFormData] = useState({
        name: gradingTemplate?.name || "",
        scaleId: gradingTemplate?.scale_id || ""
    });

    console.log(scales);

    const gradingFields: FormField[] = [
        { name: "name", label: "Nombre del Template", type: "text", placeholder: "Ej. 70/20/10", required: true },
        {
            name: "scaleId",
            label: "Tipo de Escala",
            type: "select",
            required: true,
            options: scales.map((s: Scale) => ({ value: s.id, label: `${s.name} (${s.min_value}-${s.max_value})` })),
        }
    ]

    const handleUpsertGradingTemplate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.scaleId) {
            setError("Ingresa los campos obligatorios");
            return;
        }

        const payload = {
            ...formData,
            name: formData.name.trim().toLowerCase()
        }

        await upsertGradingTemplate(mode, gradingTemplateId, payload);
    }

    const formChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        setError("");
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? `Añadir template` : `Editar template`}
            fields={gradingFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onCancel}
            onChange={formChange}
            onSubmit={handleUpsertGradingTemplate}
        />
    )
}