import React from "react";
import { CancelButton, PrimaryButton } from "./Buttons.tsx";

export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "number" | "select";
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    options?: { value: string; label: string }[];
}

interface DynamicModalFormProps {
    isOpen: boolean;
    title: string;
    fields: FormField[];
    formData: any;
    formError: string;
    formLoading: boolean;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function DynamicModalForm({
                                             isOpen,
                                             title,
                                             fields,
                                             formData,
                                             formError,
                                             formLoading,
                                             onClose,
                                             onChange,
                                             onSubmit
                                         }: DynamicModalFormProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-custom-black">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-5 overflow-y-auto">
                    {formError && (
                        <div className="mb-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm">
                            {formError}
                        </div>
                    )}

                    <form id="dynamic-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                        {fields.map((field) => (
                            <div key={field.name} className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    {field.label}
                                </label>

                                {field.type === "select" ? (
                                    <select
                                        name={field.name}
                                        required={field.required}
                                        value={formData[field.name] || ""}
                                        onChange={onChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccione una opción...</option>
                                        {field.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        value={formData[field.name] || ""}
                                        onChange={onChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                )}
                            </div>
                        ))}
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <CancelButton title="Cancelar" onClick={onClose} />
                    <PrimaryButton type="submit" form="dynamic-form" title={formLoading ? "Guardando..." : "Guardar"} />
                </div>
            </div>
        </div>
    );
}