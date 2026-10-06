import { useState } from "react";
import type { modeTypes } from "../../../../features/types/types.ts";
import { useUpsertAnnouncements } from "../../../hooks/announcements/useUpsertAnnouncements.ts";
import DynamicModalForm, { type FormField } from "../../../../components/ui/modals/ModalForm.tsx";

import type { Announcement } from "../../../types/types.ts";
import { useCourses } from "../../../hooks/announcements/useCourses.ts";
import { useProfiles } from "../../../hooks/announcements/useProfiles.ts";

interface AnnouncementModalFormProps {
    mode: modeTypes;
    onClose: () => void;
    onSuccess: () => void;
    announcement?: Announcement;
}

const FORM_REGEXP = {
    name: /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9À-ÿ\s´\.,]+$/
}

export function AnnouncementModalForm({ mode, onClose, announcement, onSuccess }: AnnouncementModalFormProps) {
    const isCreateMode = mode === "create";
    const { loading, error, setError, upsertAnnouncement } = useUpsertAnnouncements(onSuccess);

    const [formData, setFormData] = useState({
        title: announcement?.title || "",
        type: announcement?.type || "GENERAL",
        targetType: announcement?.target_type || "ALL",
        targetValue: "",
        profileSearch: "",
        description: announcement?.description || "",
        caption: announcement?.caption || ""
    });

    const { courses } = useCourses(formData.targetType);
    const { users } = useProfiles(formData.profileSearch);

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            if (name === "targetType") {
                newData.targetValue = "";
                newData.profileSearch = "";
            }

            return newData;
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!FORM_REGEXP.name.test(formData.title)) {
            setError("El título debe contener solo caracteres válidos.");
            return;
        }

        if (formData.targetType !== "ALL" && !formData.targetValue) {
            setError("Debes seleccionar un destinatario específico.");
            return;
        }

        const { profileSearch, ...apiPayload } = formData;


        console.log(mode, announcement ? announcement.id : null, JSON.stringify(apiPayload, null, 2));
        await upsertAnnouncement(mode, announcement ? announcement.id : null, apiPayload);
    }

    const baseFields: FormField[] = [
        {
            name: "title",
            label: "Título del comunicado",
            type: "text",
            placeholder: "Ej: Reunión de padres",
            required: true
        },
        {
            name: "caption",
            label: "Leyenda",
            type: "text",
            placeholder: "Reunion breve para hablar sobre el avance de los estudiantes",
            required: true
        },
        {
            name: "type",
            label: "Etiqueta del comunicado",
            type: "select",
            options: [
                { value: "GENERAL", label: "General" },
                { value: "EVENT", label: "Evento" },
                { value: "EMERGENCY", label: "Urgente" },
                { value: "DEADLINE", label: "Fecha Límite" },
                { value: "POLL", label: "Encuesta" }
            ],
            required: true
        },
        {
            name: "targetType",
            label: "Dirigido a",
            type: "select",
            options: [
                { value: "ALL", label: "Toda la institución" },
                { value: "COURSE", label: "Un curso específico" },
                { value: "ROLE", label: "Un rol específico" },
                { value: "PROFILE", label: "Un usuario específico" }
            ],
            required: true
        }
    ];

    const dynamicFields: FormField[] = [];

    if (formData.targetType === "COURSE") {
        dynamicFields.push({
            name: "targetValue",
            label: "Seleccionar Curso",
            type: "select",
            options: courses?.map(c => ({ value: c.id, label: c.course_name })) || [],
            required: true
        });
    } else if (formData.targetType === "ROLE") {
        dynamicFields.push({
            name: "targetValue",
            label: "Seleccionar Rol",
            type: "select",
            options: [
                { value: "student", label: "Estudiantes" },
                { value: "teacher", label: "Profesores" },
                { value: "parent", label: "Acudientes" },
                { value: "principal", label: "Directivos" }
            ],
            required: true
        });
    } else if (formData.targetType === "PROFILE") {
        dynamicFields.push(
            {
                name: "profileSearch",
                label: "Buscar usuario",
                type: "text",
                placeholder: "Ej: Carlos...",
                required: false
            },
            {
                name: "targetValue",
                label: "Resultados de búsqueda",
                type: "select",
                options: users?.map(u => ({ value: u.id, label: `${u.first_name} ${u.first_last_name}` })) || [],
                required: true
            }
        );
    }

    const descriptionField: FormField = {
        name: "description",
        label: "Descripción",
        type: "textarea",
        rows: 5,
        placeholder: "Escribe el contenido detallado del comunicado...",
        required: true
    };

    const finalFields = [...baseFields, ...dynamicFields, descriptionField];

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? "Nuevo comunicado" : "Editar comunicado"}
            fields={finalFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
        />
    )
}