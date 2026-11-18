import { HiPlus, HiTrash } from "react-icons/hi";

export interface ScheduleSlot {
    day: number;
    startTime: string;
    endTime: string;
    room: string | null;
}

interface ScheduleSlotsFormProps {
    slots: ScheduleSlot[];
    onChange: (slots: ScheduleSlot[]) => void;
}

const DAYS = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
];

const inputClass =
    "px-4 py-3 text-sm w-full bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-shadow";

export function ScheduleSlotsForm({ slots, onChange }: ScheduleSlotsFormProps) {
    const addSlot = () => {
        onChange([
            ...slots,
            { day: 1, startTime: "", endTime: "", room: "" },
        ]);
    };

    const removeSlot = (index: number) => {
        onChange(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, patch: Partial<ScheduleSlot>) => {
        onChange(
            slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {slots.map((slot, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/70 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">
                            Horario {index + 1}
                        </span>
                        {slots.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSlot(index)}
                                className="text-gray-400 cursor-pointer hover:text-red-600 p-1 rounded transition-colors"
                                title="Eliminar horario"
                            >
                                <HiTrash className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="p-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block tracking-wide">
                                    Día
                                </label>
                                <select
                                    value={slot.day}
                                    onChange={(e) =>
                                        updateSlot(index, {
                                            day: Number(e.target.value),
                                        })
                                    }
                                    className={`${inputClass} cursor-pointer`}
                                >
                                    {DAYS.map((d) => (
                                        <option key={d.value} value={d.value}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block tracking-wide">
                                    Salón{" "}
                                    <span className="text-gray-300 normal-case font-normal">
                                        (opcional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={slot.room ?? "Sin Aula"}
                                    onChange={(e) =>
                                        updateSlot(index, { room: e.target.value })
                                    }
                                    placeholder="203"
                                    maxLength={20}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block tracking-wide">
                                Hora
                            </label>
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                        updateSlot(index, {
                                            startTime: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} flex-1`}
                                />
                                <span className="text-gray-400 text-xs shrink-0">
                                    a
                                </span>
                                <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                        updateSlot(index, {
                                            endTime: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} flex-1`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addSlot}
                className="w-full py-2 border cursor-pointer border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
            >
                <HiPlus className="size-4" />
                Agregar otro horario
            </button>
        </div>
    );
}