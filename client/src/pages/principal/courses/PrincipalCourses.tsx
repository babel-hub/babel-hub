import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import api from "../../../api/client.ts";
import PrimaryButton from "../../../components/PrimaryButton.tsx";
import LoadingPage from "../../../components/LoadingPage.tsx";
import DynamicModalForm, { type FormField } from "../../../components/ModalForm.tsx";

interface ClassData {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    director_name: string;
    student_count: string;
}

const PrincipalCourses = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState<ClassData[]>([]);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        year: new Date().getFullYear().toString(),
        teacherId: "",
    });

    const courseFields: FormField[] = [
        {
            name: "name",
            label: "Nombre del Curso",
            type: "text",
            placeholder: "Ej. 10-A",
            required: true
        },
        {
            name: "year",
            label: "Año Lectivo",
            type: "number",
            required: true,
            disabled: true
        },
        {
            name: "teacherId",
            label: "Director de Grupo (Profesor)",
            type: "select",
            required: true,
            options: availableTeachers.map(t => ({ value: t.id, label: t.full_name }))
        }
    ];

    const loadClasses = async () => {
        setLoading(true);
        try {
            const response = await api.get("/courses");
            setCourses(response.data.courses || response.data);
        } catch (loadError) {
            console.error("Failed to load courses", loadError);
            setError("No se pudieron cargar los cursos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        const fetchTeachersForDropdown = async () => {
            try {
                const response = await api.get('/teacher?available=true');
                console.log(response);
                setAvailableTeachers(response.data.teachers || response.data);
            } catch (error) {
                console.error("Error fetching teachers:", error);
            }
        };

        if (isModalOpen && availableTeachers.length === 0) {
            fetchTeachersForDropdown();
        }
    }, [isModalOpen, availableTeachers.length]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            await api.post('/courses', formData);

            setIsModalOpen(false);
            setFormData({ name: "", year: new Date().getFullYear().toString(), teacherId: ""});

            await loadClasses();

        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al crear el curso.");
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    if (loading && courses.length === 0) return <LoadingPage title="Cargando cursos..." />

    return (
        <div>
            {/* Header */}
            <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl lg:text-2xl font-bold text-custom-black">Gestión de Cursos</h2>
                <PrimaryButton onClick={() => setIsModalOpen(true)} title="Nuevo Curso"/>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="grid md:grid-cols-2 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map((course) => (
                    <button
                        key={course.id}
                        onClick={() => navigate(`${course.id}`)}
                        className="bg-white cursor-pointer border border-gray-100 shadow rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary font-bold text-lg">
                                {course.course_name ? course.course_name.replace("-", "") : "CC"}
                            </div>
                            <div className="overflow-hidden text-left">
                                <h3 className="font-bold text-custom-black text-lg truncate">
                                    Director
                                </h3>
                                <p className="text-gray-500 text-sm truncate">
                                    {course.director_name || "Sin asignar"}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Estudiantes:</span>
                                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">
                                    {course.student_count || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Año:</span>
                                <span className="text-gray-700 font-medium">{course.year}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <DynamicModalForm
                isOpen={isModalOpen}
                title="Crear Nuevo Curso"
                fields={courseFields}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleCreateCourse}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormError("");
                    setFormData({ name: "", year: "2026", teacherId: "" });
                }}
            />
        </div>
    );
}

export default PrincipalCourses;