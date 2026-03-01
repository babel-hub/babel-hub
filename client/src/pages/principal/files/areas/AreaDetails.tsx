import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../../api/client.ts";
import DynamicModalForm, { type FormField } from "../../../../components/ModalForm.tsx";
import {PrimaryButton} from "../../../../components/Buttons.tsx";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import {LoadingContent} from "../../../../components/Loadings.tsx";

export default function AreaSubjects() {
    const { areaId } = useParams<{ areaId: string }>();
    const navigate = useNavigate();

    // Page State
    const [areaName, setAreaName] = useState("");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🌟 UPDATED: Modal & Form State
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'none'>('none');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({ name: "" });

    const fetchPageData = async () => {
        try {
            setLoading(true);
            const [areaRes, subjectsRes] = await Promise.all([
                api.get(`/areas/${areaId}`),
                api.get(`/areas/${areaId}/subjects`)
            ]);

            setAreaName(areaRes.data.area.name);
            setSubjects(subjectsRes.data.subjects);
        } catch (err: any) {
            setError("Error al cargar los datos del área.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (areaId) fetchPageData();
    }, [areaId]);

    const subjectFormItems: FormField[] = [
        {
            name: "name",
            label: "Nombre de la Materia",
            type: "text",
            placeholder: "Ej. Biología",
            required: true
        }
    ];

    const openEditModal = (subjectId: string, currentName: string) => {
        setSelectedSubjectId(subjectId);
        setFormData({ name: currentName }); // Pre-fill the input!
        setModalMode('edit');
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            if (modalMode === 'create') {
                await api.post("/subjects", { name: formData.name, areaId });
            } else if (modalMode === 'edit') {
                await api.put(`/subjects/${selectedSubjectId}`, { name: formData.name, areaId });
            }

            setModalMode('none');
            setFormData({ name: "" });
            setSelectedSubjectId(null);
            await fetchPageData();

        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al guardar la materia.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la materia "${subjectName}"?`);
        if (!confirmDelete) return;

        try {
            await api.delete(`/subjects/${subjectId}`);
            await fetchPageData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error al eliminar la materia.");
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <LoadingContent title="Cargando materias..." />;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-3">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <div>
                        <h1 className="text-2xl font-bold text-custom-black">
                            Área: {areaName}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Gestión de Materias</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <PrimaryButton
                        onClick={() => {
                            setFormData({ name: "" });
                            setModalMode('create');
                        }}
                        title="Nueva Materia"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {subjects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay materias registradas en esta área todavía.</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {subjects.map((subject) => (
                            <li key={subject.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-4 rounded-lg transition-colors">
                                <span className="font-medium text-custom-black">{subject.name}</span>

                                <div className="space-x-4">
                                    <button
                                        onClick={() => openEditModal(subject.id, subject.name)}
                                        className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 🌟 UPDATED: Reusable Modal now handles both actions dynamically */}
            <DynamicModalForm
                isOpen={modalMode !== 'none'}
                title={modalMode === 'create' ? `Añadir Materia a ${areaName}` : `Editar Materia`}
                fields={subjectFormItems}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleModalSubmit}
                onClose={() => {
                    setModalMode('none');
                    setFormError("");
                    setFormData({ name: "" });
                    setSelectedSubjectId(null);
                }}
            />
        </div>
    );
}