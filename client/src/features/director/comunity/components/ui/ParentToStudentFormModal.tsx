import React, { useState } from "react";
import DynamicModalForm, { type FormField } from "../../../../../components/ui/modals/ModalForm.tsx";
import type { Parent } from "../../types";
import { reverseName } from "../../../../../types";
import { useStudentSearch } from "../../hooks/parents/useSearchStudent.ts";
import { useAssignStudentSubmit } from "../../hooks/parents/useAssignStudentSubmit.ts";

interface ParentToStudentFormModalProps {
    parent: Parent;
    onClose: () => void;
    onSuccess: () => void;
}

export function ParentToStudentFormModal({ parent, onClose, onSuccess }: ParentToStudentFormModalProps) {
    const [formData, setFormData] = useState({
        searchQuery: "",
        studentId: "",
        relationshipType: "",
    });

    const { students, loading: loadingStudents } = useStudentSearch(formData.searchQuery);
    const { assignStudent, loading, error, setError } = useAssignStudentSubmit(onSuccess);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "searchQuery") {
                return { ...prev, [name]: value, studentId: "" };
            }
            return { ...prev, [name]: value };
        });

        if (error) setError("");
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.studentId) {
            setError("Por favor, selecciona un estudiante de los resultados.");
            return;
        }
        if (!formData.relationshipType) {
            setError("Por favor, selecciona el parentesco.");
            return;
        }

        const isAlreadyLinked = parent.students?.some(s => s.student_id === formData.studentId);
        if (isAlreadyLinked) {
            setError("Este estudiante ya está vinculado a este acudiente.");
            return;
        }

        const payload = {
            parentId: parent.parent_id,
            studentId: formData.studentId,
            relationshipType: formData.relationshipType
        };

        await assignStudent(payload);
    };

    const studentOptions = students.map(student => ({
        value: student.student_id,
        label: reverseName({
            firstName: student.student_first_name,
            middleName: student.student_middle_name,
            firstLastName: student.student_first_last_name,
            secondLastName: student.student_second_last_name
        })
    }));

    const formFields: FormField[] = [
        {
            name: "searchQuery",
            label: "Buscar Estudiante",
            type: "text",
            placeholder: "Escribe un nombre o apellido...",
            required: false
        },
        {
            name: "studentId",
            label: "Resultados de la búsqueda",
            type: "select",
            required: true,
            options: [
                {
                    value: "",
                    label: formData.searchQuery.length < 2
                        ? "-- Escribe para buscar --"
                        : (loadingStudents ? "Buscando..." : (studentOptions.length === 0 ? "No hay resultados" : "-- Seleccionar Estudiante --"))
                },
                ...studentOptions
            ]
        },
        {
            name: "relationshipType",
            label: "Parentesco",
            type: "select",
            required: true,
            options: [
                { value: "", label: "-- Seleccionar Relación --" },
                { value: "father", label: "Padre" },
                { value: "mother", label: "Madre" },
                { value: "other", label: "Otro" }
            ]
        }
    ];

    const parentName = `${parent.parent_first_name} ${parent.parent_first_last_name}`;

    return (
        <DynamicModalForm
            isOpen={true}
            title={`Vincular estudiante a ${parentName}`}
            fields={formFields}
            formData={formData}
            formError={error}
            formLoading={loading}
            onChange={handleFormChange}
            onSubmit={handleModalSubmit}
            onClose={onClose}
        />
    );
}