import { useState } from "react";
import DynamicModalForm, {type FormField} from "../../../../components/ui/modals/ModalForm.tsx";
import { useEditSchedule } from "../hooks/useEditSchedule.ts";
import type { TeacherSchedule } from "../types/types.ts";

interface TeacherModalFormProps {
    initialData: TeacherSchedule;
    onClose: () => void;
    onSuccess: () => void;
}

export function TeacherModalForm({ initialData, onClose, onSuccess }: TeacherModalFormProps) {
    const { editSchedule, loading, error, setError } = useEditSchedule(onSuccess);

    const [formData, setFormData] = useState({
        classId: initialData.class_id,
        day: initialData.day_of_week.toString(),
        startTime: initialData.start_time.substring(0, 5),
        endTime: initialData.end_time.substring(0, 5),
        room: initialData.room || ""
    });

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("")
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.day || !formData.startTime.trim() || !formData.endTime.trim()) {
            setError("Los campos de día y horas son obligatorios.");
            return;
        }

        if (formData.endTime <= formData.startTime) {
            setError("La hora de fin debe ser mayor a la de inicio");
            return;
        }

        await editSchedule(initialData.id, {
            classId: formData.classId,
            day: parseInt(formData.day),
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room
        });
    };

    const scheduleFields: FormField[] = [
        {
            name: "day",
            label: "Día de la semana",
            type: "select",
            options: [
                { value: "1", label: "Lunes" },
                { value: "2", label: "Martes" },
                { value: "3", label: "Miércoles" },
                { value: "4", label: "Jueves" },
                { value: "5", label: "Viernes" },
                { value: "6", label: "Sábado" },
            ],
            required: true,
        },
        {
            name: "startTime",
            label: "Hora de inicio",
            type: "time",
            required: true,
        },
        {
            name: "endTime",
            label: "Hora de fin",
            type: "time",
            required: true,
        },
        {
            name: "room",
            label: "Salón (Opcional)",
            type: "text",
            placeholder: "Ej. Salón 401A",
            required: false,
        }
    ];

    return (
        <DynamicModalForm
            isOpen={true}
            title={`Editar horario de ${initialData.subject_name}`}
            fields={scheduleFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onClose={onClose}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
        />
    );
}