import ListData, { type ListItemProps } from "../../../components/List.tsx";
import { useNavigate } from "react-router-dom";
import api from "../../../api/client.ts";
import React, { useEffect, useState } from "react";
import { LoadingContent } from "../../../components/Loadings.tsx";
import DynamicModalForm, {type FormField} from "../../../components/ModalForm.tsx";

function FilesDashboard() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState<string>("");
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: ""
    });

    const navigate = useNavigate();

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await api.get("/areas");
            setAreas(response.data.areas);
        } catch (dbError) {
            setError("Error cargando lar areas" + dbError);
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
                            onClick={() => setIsModalOpen(true)}
                        >
                            Añadir nueva área
                        </button>
                    </li>
                </ul>
            )
        },
        {
            label: "Eventos",
        },
        {
            label: "Asistencia",
        },
    ];

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setFormLoading(true);
            await api.post("/areas", formData);
            setIsModalOpen(false);
            setFormData({ name: "" });
            await fetchAreas()

        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al crear la area.");
        } finally {
            setFormLoading(false);
        }
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
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
                isOpen={isModalOpen}
                title="Crear Nueva Area"
                fields={areaFormItems}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleCreateArea}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormError("");
                    setFormData({ name: "" });
                }}
            />
        </div>
    );
}

export default FilesDashboard;