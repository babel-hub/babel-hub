import { useState } from "react";
import toast from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { CancelButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import {createCourseBreaks, updateCourseBreakGroup} from "../../api";
import type {BreakGroup} from "../../types";

interface BreakGroupFormModalProps {
    courseId: string;
    mode: "create" | "edit";
    group: BreakGroup | null;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS = [
    { value: 1, label: "Lun" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Mié" },
    { value: 4, label: "Jue" },
    { value: 5, label: "Vie" },
    { value: 6, label: "Sáb" },
];

export function BreakGroupFormModal({
                                        courseId,
                                        mode,
                                        group,
                                        onClose,
                                        onSuccess,
                                    }: BreakGroupFormModalProps) {
    const [name, setName] = useState(group?.name ?? "");
    const [days, setDays] = useState<number[]>(group?.days ?? [1]);
    const [startTime, setStartTime] = useState(group?.start_time.substring(0, 5) ?? "");
    const [endTime, setEndTime] = useState(group?.end_time.substring(0, 5) ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleDay = (d: number) => {
        setDays(prev =>
            prev.includes(d)
                ? prev.filter(x => x !== d)
                : [...prev, d].sort((a, b) => a - b)
        );
    };

    const validate = (): string | null => {
        if (!name.trim()) return "El nombre es obligatorio";
        if (days.length === 0) return "Selecciona al menos un día";
        if (!startTime || !endTime) return "Completa las horas";
        if (endTime <= startTime) return "La hora de fin debe ser mayor a la de inicio";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const v = validate();
        if (v) { setError(v); return; }

        setLoading(true);
        try {
            const basePayload = {
                name: name.trim(),
                days,
                start_time: startTime,
                end_time: endTime,
            };

            if (mode === "create") {
                await createCourseBreaks(courseId, basePayload);
                toast.success("Descanso creado");
            } else if (group) {
                await updateCourseBreakGroup(courseId, {
                    ids: group.ids,
                    ...basePayload,
                });
                toast.success("Descanso actualizado");
            }
            onSuccess();
        } catch (err: any) {
            setError(err?.response?.data?.message || "No se pudo guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <h3 className="text-xl pl-2 font-bold text-custom-black">
                        {mode === "create" ? "Nuevo descanso" : "Editar descanso"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-500 p-1"
                    >
                        <HiX className="size-5" />
                    </button>
                </div>

                <div className="px-5 py-3 overflow-y-auto flex-1">
                    <form id="break-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Recreo, Almuerzo..."
                                maxLength={50}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Días <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-6 gap-1.5">
                                {DAYS.map((d) => {
                                    const selected = days.includes(d.value);
                                    return (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => toggleDay(d.value)}
                                            className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                selected
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Inicio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="text-sm mt-3 bg-red-100 flex items-start gap-2 p-2 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                <div className="px-5 pb-3 flex justify-end gap-3">
                    <CancelButton title="Cancelar" onClick={onClose} />
                    <button
                        type="submit"
                        form="break-form"
                        disabled={loading}
                        className={`bg-primary text-sm text-white border border-primary hover:border-primary-darker hover:bg-primary-darker px-5 py-2 rounded-lg transition-colors cursor-pointer w-full ${
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