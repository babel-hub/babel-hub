import DynamicModalForm, {type FormField} from "../../../../../components/ui/modals/ModalForm.tsx";
import type { modeTypes } from "../../../../types/types.ts";
import React, { useState } from "react";
import {useUpsertAnnouncements} from "../../hooks/useUpsertAnnouncements.ts";

interface AnnouncementModalFormProps {
    mode: modeTypes;
    onClose: () => void;
    onSuccess: () => void;
    announcement: any;
}

const FORM_REGEXP = {
    name: /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9À-ÿ\s´\.,]+$/
}

export function AnnouncementModalForm({ mode, onClose, announcement, onSuccess }: AnnouncementModalFormProps) {
    const isCreateMode = mode === "create";
    const { loading, error, setError, upsertAnnouncement } = useUpsertAnnouncements(onSuccess);
    const [formData, setFormData] = useState({
        announcementTitle: "",
        announcementDescription: "",
    })

    const announcementFields: FormField[] = [
        { name: "announcementTitle", label: "Titulo del comunicado", type: "text", placeholder: "Reunino de profesores", required: true },
        /* Here goes the target  */
        { name: "announcementDescription", label: "Descripcion", type: "text", placeholder: "Descripcion del comunicado", required: true },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!FORM_REGEXP.name.test(formData.announcementTitle)) {
            setError("El titulo debe conterner solo caracteres validos");
            return;
        }

        await upsertAnnouncement(mode, announcement ? announcement.id : null, formData);
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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