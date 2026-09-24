import React, { useState } from "react";
import { CancelButton } from "../buttons/Buttons.tsx";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import {GiCancel} from "react-icons/gi";

export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "number" | "select" | "date" | "time";
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    options?: { value: string; label: string }[];
}

interface DynamicModalFormProps {
    isOpen: boolean;
    profileCreated?: Boolean;
    title: string;
    fields: FormField[];
    formData: any;
    formError: string;
    formLoading: boolean;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement >) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function DynamicModalForm({
                                             isOpen,
                                             profileCreated,
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
    const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});
    const [policyAccepted, setPolicyAccepted] = useState(false);

    const togglePassword = (fieldName: string) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const isSubmitDisabled = formLoading || (profileCreated && !policyAccepted);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <h3 className="text-xl pl-2 font-bold text-custom-black">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:bg-gray-100 border border-transparent transition-colors hover:border-gray-300 rounded-md hover:text-gray-500 cursor-pointer p-1 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-5 py-3 overflow-y-auto">
                    <form id="dynamic-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                        {fields.map((field) => (
                            <div key={field.name} className="flex flex-col gap-1.5">
                                <label htmlFor={`${field.name}_`} className="text-sm font-semibold text-gray-700">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === "select" ? (
                                    <select
                                        id={`${field.name}_`}
                                        name={field.name}
                                        required={field.required}
                                        value={formData[field.name] || ""}
                                        onChange={onChange}
                                        className="w-full bg-gray-50 capitalize border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                    >
                                        <option value="" disabled>Seleccione una opción...</option>
                                        {field.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (field.type === "date" || field.type === "time") ? (
                                    <input
                                        id={`${field.name}_`}
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={onChange}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    />
                                ) : field.type === "password" ? (
                                    <div className="w-full relative">
                                        <input
                                            id={`${field.name}_`}
                                            type={passwordVisibility[field.name] ? "text" : "password"}
                                            name={field.name}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            disabled={field.disabled}
                                            value={formData[field.name] || ""}
                                            onChange={onChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <div className="absolute right-4 top-3.5">
                                            <button
                                                type="button"
                                                className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
                                                onClick={() => togglePassword(field.name)}
                                            >
                                                {passwordVisibility[field.name] ? <LuEye /> : <LuEyeClosed />}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        id={`${field.name}_`}
                                        type={field.type}
                                        name={field.name}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        value={formData[field.name] || ""}
                                        onChange={onChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                )
                                }
                            </div>
                        ))}

                        {profileCreated && (
                            <label
                                htmlFor="policy"
                                className="checkbox-wrapper-13 flex items-start gap-3 mt-2 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    id="policy"
                                    name="policy"
                                    required
                                    checked={policyAccepted}
                                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                                />
                                <span className="text-sm text-gray-600 leading-snug select-none">
                                    Al hacer clic en guardar aceptas los{' '}
                                    <a href="#" className="text-primary font-semibold hover:underline">
                                        Términos y Condiciones
                                    </a>{' '}
                                    de Babel.
                                </span>
                            </label>
                        )}
                    </form>

                    {
                        formError.length > 0 && (
                            <div className="text-sm mt-3 bg-red-100 flex items-start gap-2 p-2 rounded-xl text-red-700">
                                <div className="min-w-4 mt-1">
                                    <GiCancel className="size-4"/>
                                </div>
                                {formError}
                            </div>
                        )
                    }
                </div>

                <div className="px-5 pb-3 flex justify-end gap-3">
                    <CancelButton title="Cancelar" onClick={onClose} />
                    <button
                        type="submit"
                        form="dynamic-form"
                        disabled={isSubmitDisabled}
                        className={`bg-primary text-sm md:text-base text-white border border-primary hover:border-primary-darker hover:bg-primary-darker px-5 py-2 rounded-lg transition-colors cursor-pointer w-full
                                    ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {formLoading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}