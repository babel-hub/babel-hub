import React, { useState } from "react";
import type { AvailableSubjects, ClassItem, Teacher } from "../../types";
import { useUpsertClass } from "../../hooks/course-details/useUpsertClass.ts";
import { useModalData } from "../../hooks/course-details/useModalData.ts";
import type { modeTypes } from "../../../../types/types.ts";
import { reverseName } from "../../../../../types";
import { ScheduleSlotsForm, type ScheduleSlot } from "./ScheduleSlotsForm.tsx";
import { CancelButton } from "../../../../../components/ui/buttons/Buttons.tsx";

interface CourseDetailsFormProps {
    id: string;
    courseName: string | undefined;
    mode: modeTypes;
    classToEdit: ClassItem | null;
    onSuccess: () => void;
    onClose: () => void;
}

export const CreateClassFormModal = ({ id, courseName, mode, classToEdit, onSuccess, onClose }: CourseDetailsFormProps) => {
    const isCreateMode = mode === "create";
    const { teachers, subjects } = useModalData(id);
    const { loading, error, setError, upsertClass } = useUpsertClass(onSuccess);

    const [formData, setFormData] = useState({
        courseId: id || "",
        subjectId: "",
        teacherId: ""
    });

    const [withSchedule, setWithSchedule] = useState(false);
    const [schedules, setSchedules] = useState<ScheduleSlot[]>([
        { day: 1, startTime: "", endTime: "", room: "" }
    ]);

    const handleFormChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
        setError("");
    };

    const handleUpsertClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.teacherId) return setError("Selecciona un profesor");
        if (isCreateMode && !formData.subjectId) return setError("Selecciona una materia");

        if (isCreateMode && withSchedule) {
            for (let i = 0; i < schedules.length; i++) {
                const s = schedules[i];
                if (!s.startTime || !s.endTime) {
                    return setError(`Completa la hora del horario ${i + 1}`);
                }
                if (s.endTime <= s.startTime) {
                    return setError(`La hora de fin debe ser mayor a la de inicio en el horario ${i + 1}`);
                }
            }
        }

        const payload = isCreateMode
            ? { ...formData, schedules: withSchedule ? schedules : [] }
            : { newTeacher: formData.teacherId };

        // TODO Backend: Cuando el endpoint /classes acepte 'schedules', esto funcionará solo.
        await upsertClass(mode, classToEdit?.class_id, payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <h3 className="text-xl pl-2 font-bold text-custom-black">
                        {isCreateMode ? "Crear Nueva Clase" : "Editar Profesor"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-500 p-1 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-5 py-3 overflow-y-auto flex-1">
                    <form id="class-form" onSubmit={handleUpsertClass} className="flex flex-col gap-4">
                        {isCreateMode && (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Curso
                                    </label>
                                    <input
                                        type="text"
                                        value={courseName || id}
                                        disabled
                                        className="w-full bg-gray-100 text-gray-500 capitalize border border-gray-200 rounded-lg px-4 py-3 text-sm cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Materia <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full bg-gray-50 capitalize border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccione una opción...</option>
                                        {subjects.map((s: AvailableSubjects) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Profesor <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleFormChange}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="" disabled>Seleccione una opción...</option>
                                {teachers.map((t: Teacher) => (
                                    <option key={t.id} value={t.id}>
                                        {reverseName({
                                            middleName: t.teacher_middle_name,
                                            secondLastName: t.teacher_second_last_name,
                                            firstName: t.teacher_first_name,
                                            firstLastName: t.teacher_first_last_name
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isCreateMode && (
                            <div className="pt-3 mt-1 border-t border-gray-100">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                                        ¿Agregar horario ahora?
                                    </span>
                                    <div className="container-toggle">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            id="schedule-toggle"
                                            checked={withSchedule}
                                            onChange={(e) => setWithSchedule(e.target.checked)}
                                        />
                                        <label className="switch" htmlFor="schedule-toggle">
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </label>

                                {withSchedule && (
                                    <div className="mt-3">
                                        <ScheduleSlotsForm
                                            slots={schedules}
                                            onChange={setSchedules}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </form>

                    {error && (
                        <div className="text-sm mt-3 bg-red-100 flex items-start gap-2 p-2 rounded-xl text-red-700">
                            <div className="min-w-4 mt-1">
                                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {error}
                        </div>
                    )}
                </div>

                <div className="px-5 pb-3 flex justify-end gap-3">
                    <CancelButton title="Cancelar" onClick={onClose} />
                    <button
                        type="submit"
                        form="class-form"
                        disabled={loading}
                        className={`bg-primary text-sm md:text-base text-white border border-primary hover:border-primary-darker hover:bg-primary-darker px-5 py-2 rounded-lg transition-colors cursor-pointer w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
};