import DynamicModalForm, { type FormField } from "../../../../../components/ui/modals/ModalForm.tsx";
import type { PeriodProps } from "../../types";
import React, { useState } from "react";
import { useUpsertPeriod } from "../../hooks/periods/useUpsertPeriod.ts";
import type { modeTypes } from "../../../../types/types.ts";

interface periodFormModalProps {
    mode: modeTypes;
    onSuccess: () => void;
    onClose: () => void;
    period: PeriodProps | undefined;
}

const periodFormItems: FormField[] = [
    { name: "name", label: "Nombre del periodo", type: "text", placeholder: "Primer Periodo", required: true },
    { name: "startDate", label: "Fecha de Inicio", type: "date", required: true },
    { name: "endDate", label: "Fecha de Fin", type: "date", required: true }
];

export function PeriodsFormModal({ mode, onSuccess, period, onClose }: periodFormModalProps) {
    const [formData, setFormData] = useState({
        name: period?.name || "",
        startDate: period?.start_date?.split('T')[0] || "",
        endDate: period?.end_date?.split('T')[0] || "",
    });

    const { loading, error, setError, upsertPeriod } = useUpsertPeriod(onSuccess);

    const handleUpsertPeriod = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (!formData.startDate || !formData.endDate) {
            setError(`Ingresa las fechas de inicio y fin del ${formData.name || 'periodo'}`);
            return;
        }

        if (end <= start) {
            setError("La fecha de fin debe ser mayor a la de inicio.");
            return;
        }

        const payload = {
            ...formData,
            name: formData.name.trim().toLowerCase(),
        };

        await upsertPeriod(mode, period?.id, payload);
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
        setError('');
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={mode === 'create' ? "Crear Nuevo Periodo" : "Editar Periodo"}
            fields={periodFormItems}
            formData={formData}
            formError={error}
            formLoading={loading}
            onChange={handleFormChange}
            onSubmit={handleUpsertPeriod}
            onClose={onClose}
        />
    )
}