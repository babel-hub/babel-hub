import { useNavigate, useParams, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import api from "../../../api/client.ts";
import { PrimaryButton } from "../../../components/Buttons.tsx";
import { FaSchool } from "react-icons/fa6";
import { LoadingPage } from "../../../components/Loadings.tsx";
import { HiDotsVertical } from "react-icons/hi";
import DynamicModalForm, { type FormField } from "../../../components/ModalForm.tsx";

interface ClassData {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    director_id: string;
    director_name: string;
    student_count: string;
}

const PrincipalCourses = () => {
    const navigate = useNavigate();
    const { id: activeCourseId } = useParams();

    const [courses, setCourses] = useState<ClassData[]>([]);
    const [indexOption, setindexOption] = useState<number | null>(null);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'none'>('none');
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
            const payload = {
                ...formData,
                name: formData.name.trim().toLowerCase()
            }

            if (modalMode === "create") {
                await api.post('/courses', payload);
            } else if (modalMode === "edit") {
                await api.put(`/courses/${selectedCourse}`, payload);
            }

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

    const handleUpdateCourse = (course: ClassData) => {
        setSelectedCourse(course.id);

        setFormData({
            name: course.course_name,
            year: course.year,
            teacherId: course.director_id,
        });

        setModalMode("edit");
        setIsModalOpen(true);
        setindexOption(null);
    }

    const handleDeleteCourse = async (id: string) => {
        setLoadingDelete(true);
        setindexOption(null);

        try {
            await api.delete(`/courses/${id}`);
            await loadClasses();

        } catch (dbError:any) {
            console.error("Error eliminando el curso", dbError);
            alert(dbError.response?.data?.message || "Error al eliminar la materia.");
        } finally {
            setLoadingDelete(false);
        }
    }

    const handleShowOptions = (index: number) => {
        setindexOption(indexOption === index ? null : index);
    }

    if (loading && courses.length === 0) return <LoadingPage title="Cargando cursos..." />

    return (
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-3rem)] ">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4`}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h2 className="text-xl font-bold text-custom-black">Cursos</h2>
                    <PrimaryButton
                        onClick={() => {
                            setModalMode('create');
                            setSelectedCourse(null);
                            setFormData({ name: "", year: new Date().getFullYear().toString(), teacherId: "" });
                            setIsModalOpen(true);
                        }}
                        title="+"
                    />
                </div>

                {error && <p className="text-red-500 m-4 text-sm">{error}</p>}

                <div className="p-3 space-y-2">
                    {courses.map((course, index) => (
                        <div
                            key={course.id}
                            className={`w-full group p-4 relative rounded-xl transition-colors flex items-center justify-between gap-3 border ${
                                activeCourseId === course.id
                                    ? 'bg-primary-shadow border-primary-shadow'
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                            }`}
                        >
                            <button
                                onClick={() => navigate(`${course.id}`)}
                                className="flex items-center cursor-pointer text-left gap-2">
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                                    activeCourseId === course.id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                                }`}>
                                    {course.course_name ? course.course_name.replace("-", "") : "CC"}
                                </div>
                                <div className="max-w-36 overflow-hidden">
                                    <h3 className={`font-bold text-base truncate ${activeCourseId === course.id ? 'text-primary-900' : 'text-custom-black'}`}>
                                        Curso {course.course_name}
                                    </h3>
                                    <p className="text-gray-500 text-xs truncate">
                                        {course.director_name || "Sin director"} • {course.student_count || 0} Est.
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={() => handleShowOptions(index)}
                                className="hover:bg-gray-100 cursor-pointer p-1.5 text-custom-black text-sm opacity-0 group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                <HiDotsVertical />
                            </button>
                            {indexOption === index && (
                                <ul className="absolute z-40 w-48 h-fit p-2 text-sm md:text-base font-semibold -right-[150px] top-3/4 bg-white text-custom-black shadow rounded-xl">
                                    <li>
                                        <button
                                            onClick={() => navigate(`/principal/notificaciones/asistencia?course=${course.course_name}`)}
                                            className="p-2 w-full text-left cursor-pointer hover:bg-gray-100 rounded-xl"
                                        >
                                            Ver asistencia
                                        </button>
                                    </li>
                                    <li>
                                        <button className="p-2 cursor-not-allowed w-full text-left hover:bg-gray-100 rounded-xl">
                                            Ver notas
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleUpdateCourse(course)}
                                            className="p-2 w-full text-left cursor-pointer hover:bg-gray-100 rounded-xl">
                                            Editar
                                        </button>
                                    </li>
                                    <hr className="border border-gray-100 rounded-xl my-2" />
                                    <li>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            disabled={loadingDelete}
                                            className="p-2 w-full text-left cursor-pointer hover:bg-red-shadow text-red-error rounded-xl">
                                            {loadingDelete ? "Cargando..." : "Eliminar"}
                                        </button>
                                    </li>
                                </ul>
                            )
                            }
                        </div>
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
                title={modalMode === 'edit' ? "Editar Curso" : "Crear Nuevo Curso"}
                fields={courseFields}
                formData={formData}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleCreateCourse}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalMode('none');
                    setSelectedCourse(null);
                    setFormError("");
                    setFormData({ name: "", year: new Date().getFullYear().toString(), teacherId: "" });
                }}
            />
        </div>
    );
}

export default PrincipalCourses;