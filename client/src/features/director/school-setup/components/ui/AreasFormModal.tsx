import DynamicModalForm, { type FormField } from "../../../../../components/ui/modals/ModalForm.tsx";
import React, { useState } from "react";
import { useUpsertArea } from "../../hooks/areas/useUpsertArea.ts";
import type { modeTypes } from "../../../../types/types.ts";
import type { Area } from "../../../../../shared/types/types.ts";

interface AreasFormModalProps {
    mode: modeTypes;
    onSuccess: () => void;
    area: Area | null;
    onClose: () => void;
}

const areaFormItems: FormField[] = [
    { name: "name", label: "Nombre del área", type: "text", placeholder: "Humanidades", required: true }
];

export function AreasFormModal({ mode, onSuccess, area, onClose }: AreasFormModalProps) {
    const [formData, setFormData] = useState({ name: area?.name || "" });

    const { loading, error, setError, upsertArea } = useUpsertArea(onSuccess);

    const handleUpsertArea = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const payload = {
            ...formData,
            name: formData.name.trim().toLowerCase()
        }

        await upsertArea(mode, area ? area.id : null, payload);
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={mode === 'create' ? "Crear Nueva Area" : "Editar Area"}
            fields={areaFormItems}
            formData={formData}
            formError={error}
            formLoading={loading}
            onChange={handleFormChange}
            onSubmit={handleUpsertArea}
            onClose={onClose}
        />
    )
}