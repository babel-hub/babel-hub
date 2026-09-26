import React, { useState } from "react";
import { LuPhone, LuUsers } from "react-icons/lu";
import { GoAlert } from "react-icons/go";
import { reverseName } from "../../../../../../types";
import { useStudentCourses } from "../../../hooks/students/useStudentCourses.ts";
import { useStudentSubmit } from "../../../hooks/students/useStudentSubmit.ts";
import {useStudentDelete} from "../../../hooks/students/useStudentDelete.ts";
import {ConfirmModal} from "../../../../../../components/ui/modals/ConfirmModal.tsx";
import type { StudentProfileData } from "../../../types";
import { Error } from "../../../../../../components/ui/blocks/Error.tsx";

const FORM_REGEX = {
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']{2,50}$/,
    username: /^[a-zA-Z0-9_.-]{3,20}$/,
    phone: /^[\d\s\-\+]{7,15}$/
};

export function StudentProfileGeneral({ data }: { data: StudentProfileData }) {
    const { courses, error: coursesError } = useStudentCourses();
    const [isEditing, setIsEditing] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<StudentProfileData | null>(null);


    const [formData, setFormData] = useState({
        firstName: data.first_name || "",
        middleName: data.middle_name || "",
        firstLastName: data.first_last_name || "",
        secondLastName: data.second_last_name || "",
        enrollmentCode: data.enrollment_code || "",
        courseId: data.course_id || "",
        userName: data.user_name || "",
        phone: data.phone || "",
    });

    const handleSuccess = () => {
        setIsEditing(false);
    };

    const { submitStudent, loading, error, setError } = useStudentSubmit(handleSuccess);
    const { deleteStudentById, loadingDelete, error: errorDelete } = useStudentDelete(handleSuccess);
    const relationshipMap: Record<string, string> = { father: "Padre", mother: "Madre", other: "Otro" };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleCancel = () => {
        setFormData({
            firstName: data.first_name || "",
            middleName: data.middle_name || "",
            firstLastName: data.first_last_name || "",
            secondLastName: data.second_last_name || "",
            enrollmentCode: data.enrollment_code || "",
            courseId: data.course_id || "",
            userName: data.user_name || "",
            phone: data.phone || "",
        });
        setIsEditing(false);
        setError("");
    };

    const handleSave = async () => {
        if (!FORM_REGEX.name.test(formData.firstName)) return setError("El primer nombre debe tener entre 2 y 50 caracteres (solo letras).");
        if (!FORM_REGEX.name.test(formData.firstLastName)) return setError("El primer apellido debe tener entre 2 y 50 caracteres (solo letras).");
        if (formData.middleName.trim() && !FORM_REGEX.name.test(formData.middleName)) return setError("El segundo nombre es inválido.");
        if (formData.secondLastName.trim() && !FORM_REGEX.name.test(formData.secondLastName)) return setError("El segundo apellido es inválido.");
        if (formData.userName.trim() && !FORM_REGEX.username.test(formData.userName)) return setError("El usuario debe tener entre 3 y 20 caracteres válidos.");
        if (formData.phone.trim() && !FORM_REGEX.phone.test(formData.phone)) return setError("El celular debe ser un número válido.");

        await submitStudent("edit", data.student_id, formData);
    };

    const inputStyles = `text-right text-sm border px-3 py-1.5 font-medium ${isEditing ? "rounded-lg bg-white border-gray-300 text-gray-900 focus:outline-none focus:border-primary" : "bg-transparent border-transparent text-gray-900"}`;

    return (
        <div className="animate-in fade-in duration-200 max-w-3xl">
            <div className="flex items-center mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Información General</h2>
            </div>

            <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Perfil</h3>
                <div className="flex flex-col overflow-hidden bg-white">

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Código</span>
                        <input
                            type="text"
                            name="enrollmentCode"
                            value={formData.enrollmentCode}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Primer Nombre</span>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Segundo Nombre</span>
                        <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Primer Apellido</span>
                        <input
                            type="text"
                            name="firstLastName"
                            value={formData.firstLastName}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Segundo Apellido</span>
                        <input
                            type="text"
                            name="secondLastName"
                            value={formData.secondLastName}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Curso</span>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={`${inputStyles} ${!isEditing ? "max-w-xs" : ""}`}
                        >
                            <option value="">Seleccione un curso</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.course_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Usuario</span>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-500">Teléfono</span>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            disabled={!isEditing}
                            className={inputStyles}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50/50">
                        <span className="text-sm font-medium text-gray-500">Correo Electrónico</span>
                        <span className="text-sm text-gray-900 flex items-center gap-2">
                            {data.email}
                        </span>
                    </div>
                </div>

                {(error || coursesError) && (
                    <div className="mt-4">
                        <Error title={error || coursesError}/>
                    </div>
                )}

                <div className="w-full mt-4 flex justify-end">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-primary hover:bg-primary-darker text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                        >
                            Editar Perfil
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-primary hover:bg-primary-darker text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                            >
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-4">Cuenta</h3>

            {errorDelete && (
                <div className="mb-4">
                    <Error title={errorDelete}/>
                </div>
            )}

            <div className="p-4 border border-red-100 bg-red-50/30 rounded-xl flex items-start sm:items-center flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-start gap-3">
                    <GoAlert className="size-5 text-red-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-700">{data.is_active ? 'Eliminar Cuenta' : 'Activar Cuenta'}</p>
                        <p className="text-xs text-red-600/80 mt-1 max-w-md">El estudiante perderá acceso a la plataforma.</p>
                    </div>
                </div>
                <div className="w-full flex justify-end sm:w-auto">
                    <button onClick={() => setStudentToDelete(data)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-sm">
                        {data.is_active ? 'Eliminar' : 'Activar'}
                    </button>
                </div>
            </div>

            {data.parents && data.parents.length > 0 && (
                <div className="mt-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Acudientes Vinculados</h3>
                    <div className="flex flex-col gap-3">
                        {data.parents.map((parent: any) => (
                            <div key={parent.parent_id} className="p-4 border border-gray-100 bg-white rounded-xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg"><LuUsers className="size-5 text-gray-400" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 capitalize">
                                            {reverseName({
                                                firstName: parent.first_name,
                                                middleName: parent.middle_name,
                                                firstLastName: parent.first_last_name,
                                                secondLastName: parent.second_last_name
                                            })}
                                        </p>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                            {relationshipMap[parent.relationship_type] || parent.relationship_type}
                                        </span>
                                    </div>
                                </div>
                                {parent.phone ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        <LuPhone className="size-4" /> {parent.phone}
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Sin teléfono</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={studentToDelete !== null}
                onClose={() => setStudentToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar al estudiante ${
                    studentToDelete ?
                        reverseName({
                            middleName: data.middle_name,
                            secondLastName: data.second_last_name,
                            firstName: data.first_name,
                            firstLastName: data.first_last_name
                        }) : "Unknow"
                }? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (studentToDelete) {
                        await deleteStudentById(studentToDelete.student_id);
                        setStudentToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />
        </div>
    );
}