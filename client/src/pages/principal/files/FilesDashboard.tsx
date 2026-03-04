import ListData, { type ListItemProps } from "../../../components/List.tsx";
import { useNavigate } from "react-router-dom";
import api from "../../../api/client.ts";
import React, { useEffect, useState } from "react";
import { LoadingContent } from "../../../components/Loadings.tsx";
import DynamicModalForm, { type FormField } from "../../../components/ModalForm.tsx";

function FilesDashboard() {
    const [areas, setAreas] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const [isModalAreaOpen, setIsModalAreaOpen] = useState(false);
    const [isModalPeriodOpen, setIsModalPeriodOpen] = useState(false);
    const [formError, setFormError] = useState<string>("");
    const [formLoading, setFormLoading] = useState(false);

    const [areaFormData, setAreaFormData] = useState({
        name: ""
    });
    const [periodFormData, setPeriodFormData] = useState({
        startDate: "",
        endDate: ""
    });

    const navigate = useNavigate();

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await api.get("/areas");
            setAreas(response.data.areas);
            console.log("AREAS", response.data);
            await fetchPeriods();
        } catch (dbError) {
            setError("Error cargando las areas" + dbError);
        } finally {
            setLoading(false);
        }
    }

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const response = await api.get("/periods");
            console.log("Periods", response);
            setPeriods(response.data.periods || response.data);
        } catch (dbError) {
            setError("Error cargando los periods" + dbError);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (areas.length === 0) {
            fetchAreas();
        }
    }, []);

    const areaFormItems: FormField[] = [
        {
            name: "name",
            label: "Nombre del area",
            type: "text",
            placeholder: "Humanidades",
            required: true
        }
    ]

    const periodFormItems: FormField[] = [
        {
            name: "startDate",
            label: "Fecha de Inicio",
            type: "text",
            placeholder: "2026-02-11",
            required: true
        },
        {
            name: "endDate",
            label: "Fecha de Fin",
            type: "text",
            placeholder: "2026-06-01",
            required: true
        }
    ]

    const listItems: ListItemProps[] = [
        {
            label: "Areas",
            content: (
                <ul className="flex flex-col gap-1">
                    {areas.map(area => (
                        <li key={area.id}>
                            <button
                                onClick={() => navigate(`areas/${area.id}`)}
                                className="w-full text-left cursor-pointer py-2 px-3 rounded-lg text-sm font-medium text-primary hover:text-primary-darker hover:bg-primary-shadow transition-colors"
                            >
                                {area.name}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            className="w-full cursor-pointer text-left py-2 px-3 mt-2 border-t border-gray-100 text-sm font-bold text-primary-600 hover:underline"
                            onClick={() => setIsModalAreaOpen(true)}
                        >
                            Añadir nueva área
                        </button>
                    </li>
                </ul>
            )
        },
        {
            label: "Periodos academicos",
            content: (
                <ul className="flex flex-col gap-1">
                    {periods.map(period => (
                        <li
                            key={period.id}
                            className="w-full text-left cursor-pointer py-2 px-3 rounded-lg text-sm font-medium text-primary hover:text-primary-darker hover:bg-primary-shadow transition-colors"
                        >
                            {period.name}
                        </li>
                    ))}
                    <li>
                        <button
                            className="w-full cursor-pointer text-left py-2 px-3 mt-2 border-t border-gray-100 text-sm font-bold text-primary-600 hover:underline"
                            onClick={() => setIsModalPeriodOpen(true)}
                        >
                            Añadir nueva periodo academico
                        </button>
                    </li>
                </ul>
            )
        },
        {
            label: "Asistencia",
        },
    ];

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setFormLoading(true);
            await api.post("/areas", areaFormData);
            setIsModalAreaOpen(false);
            setAreaFormData({ name: "" });
            await fetchAreas()

        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al crear la area.");
        } finally {
            setFormLoading(false);
        }
    }

    const handleCreatePeriod = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setFormLoading(true);
            await api.post("/periods", periodFormData);
            setIsModalPeriodOpen(false);
            setPeriodFormData({ startDate: "", endDate: "" });
            await fetchPeriods();
        } catch (err: any) {

        } finally {
            setFormLoading(false);
        }
    }

    const handleAreaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setAreaFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePeriodFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setPeriodFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <LoadingContent title="Cargando areas..." /> ;
    if (error) return <LoadingContent title="Cargando areas..." /> ;

    return (
        <div>
            <ListData data={listItems} />

            <DynamicModalForm
                isOpen={isModalAreaOpen}
                title="Crear Nueva Area"
                fields={areaFormItems}
                formData={areaFormData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleAreaFormChange}
                onSubmit={handleCreateArea}
                onClose={() => {
                    setIsModalAreaOpen(false);
                    setFormError("");
                    setAreaFormData({ name: "" });
                }}
            />

            <DynamicModalForm
                isOpen={isModalPeriodOpen}
                title="Crear Nuevo Periodo"
                fields={periodFormItems}
                formData={periodFormData}
                formError={formError}
                formLoading={formLoading}
                onChange={handlePeriodFormChange}
                onSubmit={handleCreatePeriod}
                onClose={() => {
                    setIsModalPeriodOpen(false);
                    setFormError("");
                    setPeriodFormData({ startDate: "", endDate: "" });
                }}
            />
        </div>
    );
}

export default FilesDashboard;