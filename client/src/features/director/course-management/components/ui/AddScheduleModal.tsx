import { useState } from "react";
import { ScheduleSlotsForm, type ScheduleSlot } from "./ScheduleSlotsForm.tsx";
import { CancelButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { useCreateSchedule } from "../../hooks/course-details/useCreateSchedule.ts";

interface AddScheduleModalProps {
    classId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddScheduleModal({
                                     classId,
                                     onClose,
                                     onSuccess,
                                 }: AddScheduleModalProps) {
    const { createSchedule, loading, error, setError } = useCreateSchedule(onSuccess);

    const [slots, setSlots] = useState<ScheduleSlot[]>([
        { day: 1, startTime: "", endTime: "", room: "" },
    ]);

    const validate = (): string | null => {
        if (slots.length === 0) return "Agrega al menos un horario";
        for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s.startTime || !s.endTime) {
                return `Completa la hora del horario ${i + 1}`;
            }
            if (s.endTime <= s.startTime) {
                return `La hora de fin debe ser mayor a la de inicio en el horario ${i + 1}`;
            }
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

       await createSchedule(classId, slots);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl pl-2 font-bold text-custom-black">
                            Agregar horario
                        </h3>
                    </div>
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
                    <form id="add-schedule-form" onSubmit={handleSubmit}>
                        <ScheduleSlotsForm slots={slots} onChange={setSlots} />
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
                        form="add-schedule-form"
                        disabled={loading}
                        className={`bg-primary text-sm md:text-base text-white border border-primary hover:border-primary-darker hover:bg-primary-darker px-5 py-2 rounded-lg transition-colors cursor-pointer w-full ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}