import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/client.ts";
import ListData, { type ListItemProps } from "../../../components/List.tsx";
import { LoadingContent } from "../../../components/Loadings.tsx";
import DynamicModalForm, { type FormField } from "../../../components/ModalForm.tsx";
import { DeleteButton, EditButton } from "../../../components/Buttons.tsx";
import toast from "react-hot-toast";
import {ConfirmModal} from "../../../components/ConfirmModal.tsx";

interface AreaProps {
    id: string;
    school_id: string;
    name: string;
}

interface PeriodsProps {
    id: string,
    name: string,
    start_date: string,
    end_date: string
}

export default function FilesDashboard() {
    const navigate = useNavigate();

    const [areas, setAreas] = useState<AreaProps[]>([]);
    const [periods, setPeriods] = useState<PeriodsProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const [isModalAreaOpen, setIsModalAreaOpen] = useState(false);
    const [areaToDelete, setAreaToDelete] = useState<AreaProps | null>(null);
    const [periodToDelete, setPeriodToDelete] = useState<PeriodsProps | null>(null);
    const [isModalPeriodOpen, setIsModalPeriodOpen] = useState(false);

    const [formLoading, setFormLoading] = useState(false);
    const [loadingDeleteArea, setLoadingAreaDelete] = useState(false);
    const [loadingDeletePeriod, setLoadingPeriodDelete] = useState(false);
    const [formError, setFormError] = useState<string>("");

    const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
    const [editingAreaId, setEditingAreaId] = useState<string | null>(null); // 🌟 NEW

    const [areaFormData, setAreaFormData] = useState({ name: "" });
    const [periodFormData, setPeriodFormData] = useState({
        name: "",
        startDate: "",
        endDate: ""
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [areasRes, periodsRes] = await Promise.all([
                api.get("/areas"),
                api.get("/periods")
            ]);

            setAreas(areasRes.data.areas || areasRes.data);
            setPeriods(periodsRes.data.periods || periodsRes.data);
        } catch (dbError: any) {
            const msg = "Error cargando los datos: " + dbError.message;
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const areaFormItems: FormField[] = [
        { name: "name", label: "Nombre del área", type: "text", placeholder: "Humanidades", required: true }
    ];

    const periodFormItems: FormField[] = [
        { name: "name", label: "Nombre del periodo", type: "text", placeholder: "Primer Periodo", required: true },
        { name: "startDate", label: "Fecha de Inicio", type: "date", required: true },
        { name: "endDate", label: "Fecha de Fin", type: "date", required: true }
    ];

    const handleSaveArea = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        try {
            setFormLoading(true);

            const payload = {
                ...areaFormData,
                name: areaFormData.name.trim().toLowerCase()
            }

            if (editingAreaId) {
                await api.put(`/areas/${editingAreaId}`, payload);
            } else {
                await api.post("/areas", { name: payload.name });
            }

            setIsModalAreaOpen(false);
            setEditingAreaId(null);
            setAreaFormData({ name: "" });
            await fetchDashboardData();

            toast.success(`Area ${editingAreaId === null ? "creada" : "editada" } correctamente`);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al guardar el área."
            console.error(msg);
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditAreaClick = (area: any) => {
        setEditingAreaId(area.id);
        setAreaFormData({ name: area.name });
        setIsModalAreaOpen(true);
    };

    const handlePeriodDelete = async (id: string) => {
        setLoadingPeriodDelete(true);

        try {
            await api.delete(`/periods/${id}`);
            await fetchDashboardData();

            setPeriodToDelete(null);
            toast.success("Periodo eliminado correctamente.");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al eliminar el periodo."
            console.error(msg);
            toast.error(msg);
        } finally {
            setLoadingPeriodDelete(false);
        }
    };

    const handleAreaDelete = async (id: string) => {
        setLoadingAreaDelete(true);

        try {
            await api.delete(`/areas/${id}`);
            await fetchDashboardData();

            setAreaToDelete(null);
            toast.success("Area eliminada correctamente.");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al eliminar el área."
            console.error(msg);
            toast.error(msg);
        } finally {
            setLoadingAreaDelete(false);
        }
    };

    const handleSavePeriod = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const start = new Date(periodFormData.startDate);
        const end = new Date(periodFormData.endDate);

        if (end <= start) {
            setFormError("La fecha de fin debe ser mayor a la de inicio.");
            return;
        }

        try {
            setFormLoading(true);

            const payload = {
                ...periodFormData,
                name: periodFormData.name.trim().toLowerCase()
            }

            if (editingPeriodId) {
                await api.put(`/periods/${editingPeriodId}`, payload);
            } else {
                await api.post("/periods", periodFormData);
            }

            setIsModalPeriodOpen(false);
            setEditingPeriodId(null);
            setPeriodFormData({ name: "", startDate: "", endDate: "" });
            await fetchDashboardData();

            toast.success(`Periodo ${editingPeriodId === null ? "creado" : "editado"} correctamente`);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al guardar el periodo."
            console.error(msg);
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditPeriodClick = (period: any) => {
        setEditingPeriodId(period.id);

        setPeriodFormData({
            name: period.name,
            startDate: period.start_date.split('T')[0],
            endDate: period.end_date.split('T')[0]
        });

        setIsModalPeriodOpen(true);
    };

    const listItems: ListItemProps[] = [
        {
            label: "Áreas",
            content: (
                <ul className="flex flex-col gap-1">
                    {areas.map(area => (
                        <li
                            key={area.id}
                            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-custom-black hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => navigate(`areas/${area.id}`)}
                                    className="cursor-pointer capitalize py-2 px-3 text-sm font-medium"
                                >
                                    {area.name}
                                </button>
                                <div className="flex gap-2">
                                    <EditButton onClick={() => handleEditAreaClick(area)} />
                                    <DeleteButton onClick={() => setAreaToDelete(area)} />
                                </div>
                            </div>
                        </li>
                    ))}
                    <li className="flex items-center justify-end">
                        <button
                            className="cursor-pointer py-2 px-3 rounded-xl transition-colors text-sm font-bold text-primary hover:text-white hover:bg-primary"
                            onClick={() => {
                                setEditingAreaId(null);
                                setAreaFormData({ name: "" });
                                setIsModalAreaOpen(true);
                            }}
                        >
                            Añadir nueva área
                        </button>
                    </li>
                </ul>
            )
        },
        {
            label: "Periodos académicos",
            content: (
                <ul className="flex flex-col gap-1">
                    {periods.map(period => (
                        <li
                            key={period.id}
                            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-custom-black hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <p>{period.name} <span className="text-gray-500 text-xs font-normal ml-2">({period.start_date.split('T')[0]} - {period.end_date.split('T')[0]})</span></p>
                                <div className="flex gap-2">
                                    <EditButton onClick={() => handleEditPeriodClick(period)} />
                                    <DeleteButton onClick={() => setPeriodToDelete(period)} />
                                </div>
                            </div>
                        </li>
                    ))}
                    <li className="flex items-center justify-end w-full">
                        <button
                            className="cursor-pointer py-2 px-3 text-sm font-bold text-primary hover:text-white hover:bg-primary rounded-xl transition-colors"
                            onClick={() => {
                                setEditingPeriodId(null);
                                setPeriodFormData({ name: "", startDate: "", endDate: "" });
                                setIsModalPeriodOpen(true);
                            }}
                        >
                            Añadir nuevo periodo académico
                        </button>
                    </li>
                </ul>
            )
        },
        {
            label: "Porcentajes Evaluativos",
            content: (
                <div className="w-full flex justify-center items-center px-2 py-5 md:p-5">
                    <div className="text-center">
                        <p className="text-gray-400">Lo sentimos, actualmente estamos trabajando esta sección.</p>
                    </div>
                </div>
            )
        },
        {
            label: "Centro de Asistencia"
        },
    ];

    if (loading) return <LoadingContent title="Cargando configuración..." /> ;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div>
            <ListData data={listItems} />

            <ConfirmModal
                isOpen={periodToDelete !== null}
                onClose={() => setPeriodToDelete(null)}
                onConfirm={async () => {
                    if (periodToDelete) {
                        await handlePeriodDelete(periodToDelete.id);
                    }
                }}
                title="¿Estas seguro?"
                loadingDelete={loadingDeletePeriod}
                message={`De eliminar el periodo ${periodToDelete?.name}`}
            />

            <ConfirmModal
                isOpen={areaToDelete !== null}
                onClose={() => setAreaToDelete(null)}
                onConfirm={async () => {
                    if (areaToDelete) {
                        await handleAreaDelete(areaToDelete.id);
                    }
                }}
                title="¿Estas seguro?"
                loadingDelete={loadingDeleteArea}
                message={`De eliminar el area ${areaToDelete?.name}`}
            />

            <DynamicModalForm
                isOpen={isModalAreaOpen}
                title={editingAreaId ? "Editar Área" : "Crear Nueva Área"}
                fields={areaFormItems}
                formData={areaFormData}
                formError={formError}
                formLoading={formLoading}
                onChange={(e) => setAreaFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                onSubmit={handleSaveArea}
                onClose={() => {
                    setIsModalAreaOpen(false);
                    setEditingAreaId(null);
                    setFormError("");
                    setAreaFormData({ name: "" });
                }}
            />

            <DynamicModalForm
                isOpen={isModalPeriodOpen}
                title={editingPeriodId ? "Editar Periodo" : "Crear Nuevo Periodo"}
                fields={periodFormItems}
                formData={periodFormData}
                formError={formError}
                formLoading={formLoading}
                onChange={(e) => setPeriodFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                onSubmit={handleSavePeriod}
                onClose={() => {
                    setIsModalPeriodOpen(false);
                    setEditingPeriodId(null);
                    setFormError("");
                    setPeriodFormData({ name: "", startDate: "", endDate: "" });
                }}
            />
        </div>
    );
}