import DynamicModalForm, { type FormField } from "../../../../../components/ui/modals/ModalForm.tsx";
import type { modeTypes } from "../../../../types/types.ts";
import React, { useState } from "react";
import { useCreateClassSchedule } from "../hooks/useCreateClassSchedule.ts";

interface ClassScheduleModalProps {
    mode: modeTypes;
    classId: string;
    onSuccess: () => void;
    onClose: () => void;
}

export function ClassScheduleModal({ mode, classId, onSuccess, onClose }: ClassScheduleModalProps) {
    const isCreateMode = "create" === mode;
    const [formData, setFormData] = useState({
        classId: classId,
        day: "",
        startTime: "",
        endTime: "",
        room: ""
    });

    const { loading, submitClassSchedule, error, setError } = useCreateClassSchedule(onSuccess);

    const classScheduleFields: FormField[] = [
        {
            name: "day",
            label: "Día de la semana",
            type: "select",
            required: true,
            options: [
                { value: "1", label: "Lunes" },
                { value: "2", label: "Martes" },
                { value: "3", label: "Miércoles" },
                { value: "4", label: "Jueves" },
                { value: "5", label: "Viernes" },
                { value: "6", label: "Sábado" },
                { value: "7", label: "Domingo" }
            ]
        },
        { name: "startTime", label: "Hora de inicio", type: "time", required: true },
        { name: "endTime", label: "Hora de fin", type: "time", required: true },
        { name: "room", label: "Salón", type: "text", placeholder: "Ej. Lab de Sistemas", required: false }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.day || !formData.startTime.trim() || !formData.endTime.trim()) {
            setError("Los campos de día y horas son obligatorios.");
            return;
        }

        if(formData.endTime < formData.startTime) {
            setError("La hora de fin debe ser mayor a la de inicio");
            return;
        }

        const payload = {
            classId: formData.classId,
            day: Number(formData.day),
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
        }

        await submitClassSchedule(payload);
    }

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, name } = event.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    }

    return (
        <DynamicModalForm
            isOpen={true}
            title={isCreateMode ? "Asignar horario" : "Editar horario"}
            fields={classScheduleFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
        />
    )
}