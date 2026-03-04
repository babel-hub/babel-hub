import { useNavigate, useParams, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import api from "../../../api/client.ts";
import { PrimaryButton } from "../../../components/Buttons.tsx";
import { FaSchool } from "react-icons/fa6";
import { LoadingPage } from "../../../components/Loadings.tsx";
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
    const { id: activeCourseId } = useParams();

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
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-3rem)] ">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4 overflow-hidden`}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h2 className="text-xl font-bold text-custom-black">Cursos</h2>
                    <PrimaryButton onClick={() => setIsModalOpen(true)} title="+" />
                </div>

                {error && <p className="text-red-500 m-4 text-sm">{error}</p>}

                <div className="overflow-y-auto p-3 space-y-2">
                    {courses.map((course) => (
                        <button
                            key={course.id}
                            onClick={() => navigate(`${course.id}`)}
                            className={`w-full text-left cursor-pointer p-4 rounded-xl transition-colors flex items-center gap-3 border ${
                                activeCourseId === course.id
                                    ? 'bg-primary-shadow border-primary-shadow'
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                            }`}
                        >
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                                activeCourseId === course.id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                            }`}>
                                {course.course_name ? course.course_name.replace("-", "") : "CC"}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className={`font-bold text-base truncate ${activeCourseId === course.id ? 'text-primary-900' : 'text-custom-black'}`}>
                                    Curso {course.course_name}
                                </h3>
                                <p className="text-gray-500 text-xs truncate">
                                    {course.director_name || "Sin director"} • {course.student_count || 0} Est.
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto ${!activeCourseId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {activeCourseId ? (
                    <Outlet />
                ) : (
                    <div className="flex items-center justify-center flex-col text-gray-400 p-10">
                        <FaSchool className="text-4xl" />
                        <h3 className="text-xl font-medium text-gray-500">Selecciona un curso</h3>
                        <p className="text-sm mt-2">Haz clic en un curso de la lista para ver sus detalles, estudiantes y clases asignadas.</p>
                    </div>
                )}
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