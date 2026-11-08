import { useMemo, useState } from "react";
import { useInfractionTypes } from "../../hooks/coexistence/useInfractionTypes.ts";
import { useUpsertCoexistence } from "../../hooks/coexistence/useUpsertCoexistence.ts";
import type { modeTypes, Severity } from "../../../../features/types/types.ts";
import type { StudentInfraction } from "../../types/types.ts";
import DynamicModalForm, {type FormField} from "../../../../components/ui/modals/ModalForm.tsx";

interface CreateInfractionModalProps {
    mode: modeTypes;
    classId: string;
    studentId: string;
    onClose: () => void;
    onSuccess: () => void;
    infraction: StudentInfraction | null;
}

const severityLabel = (s: Severity) => {
    return s === "high" ? "Grave" : s === "medium" ? "Media" : "Leve";
};

export function UpsertInfractionModal({
                                          mode,
                                          classId,
                                          studentId,
                                          onClose,
                                          onSuccess,
                                          infraction
                                      }: CreateInfractionModalProps) {
    const { types, loading: loadingTypes } = useInfractionTypes();
    const { upsertCoexistence, loading, error, setError } = useUpsertCoexistence(onSuccess);

    const [formData, setFormData] = useState({
        infractionTypeId: infraction?.infraction_type_id ?? "",
        description: infraction?.description ?? "",
        escalate: "false",
        monitoringNotes: "",
    });


    const fields = useMemo<FormField[]>(() => {
        const base: FormField[] = [
            {
                name: "infractionTypeId",
                label: "Tipo de infracción",
                type: "select",
                required: true,
                loadingField: loadingTypes,
                options: types.map(t => ({
                    value: t.id,
                    label: `${t.name} — ${severityLabel(t.severity)}`,
                })),
            },
            {
                name: "description",
                label: "Descripción",
                type: "textarea",
                rows: 3,
                placeholder: "Describe lo que pasó...",
            },
        ];

        if (mode === "create") {
            base.push({
                name: "escalate",
                label: "¿Requiere monitoreo del curso?",
                type: "radio",
                required: true,
                options: [
                    { value: "false", label: "No — solo infracción de clase" },
                    { value: "true",  label: "Sí — crear seguimiento visible a todo el curso" },
                ],
            });

            if (formData.escalate === "true") {
                base.push({
                    name: "monitoringNotes",
                    label: "Notas de seguimiento",
                    type: "textarea",
                    required: true,
                    rows: 3,
                    placeholder: "Explica por qué este caso requiere seguimiento...",
                });
            }
        }
        return base;
        }, [types, loadingTypes, formData.escalate, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const escalate = formData.escalate === "true";

        if (!formData.infractionTypeId) {
            setError("Selecciona un tipo de infracción");
            return;
        }
        if (escalate && !formData.monitoringNotes.trim()) {
            setError("Las notas de seguimiento son obligatorias al escalar");
            return;
        }

        const payload = mode === "create" ? {
            infractionTypeId: formData.infractionTypeId,
            description: formData.description.trim() || null,
            escalate: formData.escalate === "true",
            monitoringNotes: formData.escalate === "true" ? formData.monitoringNotes.trim() : null,
            studentId,
        } : {
            infractionTypeId: formData.infractionTypeId,
            description: formData.description.trim() || null,
            studentId,
        };

        await upsertCoexistence(classId, mode, infraction ? infraction.id : null, payload);
    };

    return (
        <DynamicModalForm
            isOpen={true}
            title={mode === "create" ? "Crear Infracción" : "Editar infracción"}
            fields={fields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    );
}