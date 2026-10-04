import type { modeTypes } from "../../../../features/types/types.ts";
import { useUpsertAnnouncements } from "../../../hooks/announcements/useUpsertAnnouncements.ts";
import { useState } from "react";
import DynamicModalForm, { type FormField } from "../../../../components/ui/modals/ModalForm.tsx";
import type {Announcement} from "../../../types/types.ts";

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
        description: announcement?.description || "",
        type: announcement?.type || "GENERAL",
        caption: announcement?.caption || "",
    });

    const announcementFields: FormField[] = [
        {
            name: "title",
            label: "Título del comunicado",
            type: "text",
            placeholder: "Reunión de profesores",
            required: true
        },
        {
            name: "caption",
            label: "Leyenda",
            type: "text",
            placeholder: "Encuentro para platicar sobre el avance de los estudiante",
            required: true
        },
        {
            name: "type",
            label: "Tipo de comunicado",
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
        /* Here goes the target */
        {
            name: "description",
            label: "Descripción",
            type: "textarea",
            rows: 5,
            placeholder: "Escribe el contenido detallado del comunicado...",
            required: true
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!FORM_REGEXP.name.test(formData.title)) {
            setError("El título debe contener solo caracteres válidos.");
            return;
        }

        await upsertAnnouncement(mode, announcement ? announcement.id : null, formData);
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? "Nuevo comunicado" : "Editar comunicado"}
            fields={announcementFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
        />
    )
}