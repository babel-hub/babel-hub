import { useEffect, useMemo, useState } from "react";
import { useInfractionTypes } from "../../hooks/useInfractionTypes.ts";
import { useUpsertCoexistence } from "../../hooks/useUpsertCoexistence.ts";
import type { modeTypes } from "../../../../features/types/types.ts";
import type { StudentInfraction } from "../../types/types.ts";
import DynamicModalForm, { type FormField } from "../../../../components/ui/modals/ModalForm.tsx";
import { toLocalDatetimeString } from "../../utils/utils.ts";

interface CreateInfractionModalProps {
    mode: modeTypes;
    classId: string | null;
    courseId: string;
    studentId: string;
    onClose: () => void;
    onSuccess: () => void;
    infraction: StudentInfraction | null;
}

export function UpsertInfractionModal({
                                          mode,
                                          classId,
                                          courseId,
                                          studentId,
                                          onClose,
                                          onSuccess,
                                          infraction
                                      }: CreateInfractionModalProps) {
    const { types, loading: loadingTypes } = useInfractionTypes();
    const { upsertCoexistence, loading, error, setError } = useUpsertCoexistence(onSuccess);

    const [formData, setFormData] = useState({
        typeId: "",
        articleId: "",
        codeId: infraction?.infraction_code_id ?? "",
        description: infraction?.description ?? "",
        occurredAt: toLocalDatetimeString(new Date()),
        locationContext: infraction?.location_context ?? "",
        escalate: "false",
        monitoringNotes: "",
    });

    useEffect(() => {
        if (mode === "edit" && infraction && types.length > 0) {
            for (const type of types) {
                for (const article of type.articles) {
                    if (article.codes.some(c => c.id === infraction.infraction_code_id)) {
                        setFormData(prev => ({
                            ...prev,
                            typeId: type.id,
                            articleId: article.id,
                            codeId: infraction.infraction_code_id
                        }));
                        return;
                    }
                }
            }

            setFormData(prev => ({
                ...prev,
                occurredAt: toLocalDatetimeString(new Date(infraction.occurred_at)),
            }));
        }
    }, [mode, infraction, types]);

    const fields = useMemo<FormField[]>(() => {
        const selectedType = types.find(t => t.id === formData.typeId);
        const selectedArticle = selectedType?.articles.find(a => a.id === formData.articleId);

        const base: FormField[] = [
            {
                name: "typeId",
                label: "Tipo de infracción",
                type: "radio",
                required: true,
                loadingField: loadingTypes,
                options: types.map(t => ({
                    value: t.id,
                    label: t.name,
                })),
            }
        ];

        if (selectedType) {
            base.push({
                name: "articleId",
                label: "Artículo",
                type: "select",
                required: true,
                options: selectedType.articles.map(a => ({
                    value: a.id,
                    label: `Art ${a.number} - ${a.name}`
                })),
            });
        }

        if (selectedArticle) {
            base.push({
                name: "codeId",
                label: "Falta Específica (Codigo)",
                type: "select",
                required: true,
                options: selectedArticle.codes.map(c => ({
                    value: c.id,
                    label: `Cod ${c.number}: ${c.name}`
                })),
            });
        }

        base.push({
            name: "description",
            label: "Descripción del incidente",
            type: "textarea",
            rows: 3,
            placeholder: "Describe detalles específicos de lo que pasó...",
        });

        if (mode === "create") {
            base.push({
                name: "occurredAt",
                label: "¿Cuándo ocurrió?",
                type: "datetime-local",
                required: true,
            });

            if (!classId) {
                base.push({
                    name: "locationContext",
                    label: "Lugar del incidente",
                    type: "text",
                    required: false,
                    placeholder: "Ej: Patio, cafetería, fuera del colegio... Déjalo vacío si fue en el salón",
                });
            }

            base.push({
                name: "escalate",
                label: "¿Requiere monitoreo del curso?",
                type: "radio",
                required: true,
                options: [
                    { value: "false", label: "No" },
                    { value: "true",  label: "Sí" },
                ],
            });

            if (formData.escalate === "true") {
                base.push({
                    name: "monitoringNotes",
                    label: "Notas de seguimiento",
                    type: "textarea",
                    required: true,
                    rows: 3,
                    placeholder: "Explica por qué este caso requiere seguimiento a nivel de curso...",
                });
            }
        }
        return base;
    }, [types, loadingTypes, formData.typeId, formData.articleId, formData.escalate, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const next = { ...prev, [name]: value };

            if (name === "typeId") {
                next.articleId = "";
                next.codeId = "";
            } else if (name === "articleId") {
                next.codeId = "";
            }

            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const escalate = formData.escalate === "true";

        if (!formData.codeId) {
            setError("Debes seleccionar el Numeral específico de la falta");
            return;
        }
        if (escalate && !formData.monitoringNotes.trim()) {
            setError("Las notas de seguimiento son obligatorias al escalar");
            return;
        }

        if (mode === "create" && new Date(formData.occurredAt) > new Date()) {
            setError("La fecha del incidente no puede ser futura");
            return;
        }

        const payload = mode === "create" ? {
            codeId: formData.codeId,
            description: formData.description.trim() || null,
            escalate,
            classId,
            locationContext: formData.locationContext.trim() || null,
            courseId,
            occurredAt: new Date(formData.occurredAt).toISOString(),
            monitoringNotes: escalate ? formData.monitoringNotes.trim() : null,
            studentId,
        } : {
            codeId: formData.codeId,
            description: formData.description.trim() || null,
            studentId,
        };

        await upsertCoexistence(mode, infraction ? infraction.id : null, payload);
    };

    return (
        <DynamicModalForm
            isOpen={true}
            title={mode === "create" ? "Reportar Infracción" : "Editar Infracción"}
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