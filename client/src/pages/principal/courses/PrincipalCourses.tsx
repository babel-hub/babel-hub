import { useNavigate, useParams, Outlet } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/client.ts";
import { PrimaryButton } from "../../../components/Buttons.tsx";
import { FaSchool } from "react-icons/fa6";
import { LoadingPage } from "../../../components/Loadings.tsx";
import { HiDotsVertical } from "react-icons/hi";
import DynamicModalForm, { type FormField } from "../../../components/ModalForm.tsx";
import toast from "react-hot-toast";
import {ConfirmModal} from "../../../components/ConfirmModal.tsx";

interface ClassData {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    director_id: string;
    director_name: string | null;
    student_count: string;
}

const regName = /^(?:\d{1,4}|\d{1,3}[A-Z])$/i;

const PrincipalCourses = () => {
    const navigate = useNavigate();
    const { id: activeCourseId } = useParams();
    const ref = useRef<HTMLUListElement | null>(null);

    const [courses, setCourses] = useState<ClassData[]>([]);
    const [courseToDelete, setCourseToDelete] = useState<ClassData | null>(null);
    const [indexOption, setindexOption] = useState<number | null>(null);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
    const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');

    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [teacherEditModal, setTeacherEditModal] = useState<string | null>(null);
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
            const msg = `No se pudieron cargar los cursos. ${loadError}`;
            console.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTeachers = async (id?: string) => {
            try {
                const url = id
                    ? `/teacher?available=true&includeTeacherId=${id}`
                    : '/teacher?available=true';

                const response = await api.get(url, { signal: controller.signal });
                setAvailableTeachers(response.data.teachers || []);
            } catch (error : any) {
                if (error.name !== 'AbortError') console.error(error);
            }
        };


        if (isModalOpen) {
            if (modalMode === "edit" && teacherEditModal) {
                fetchTeachers(teacherEditModal);
            } else {
                fetchTeachers();
            }
        }

        return () => controller.abort();
    }, [isModalOpen, teacherEditModal]);



    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setindexOption(null);
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!regName.test(formData.name)) {
            toast.error("El nombre del curso debe ser alfanumerico. Ej 10A, 305, 407, 11B etc.");
            return;
        }

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

            toast.success(`Curso ${modalMode === "create" ? "creado" : "editado"} correctamente`);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al crear el curso.";
            console.error(msg);
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateCourse = (course: ClassData) => {
        setSelectedCourse(course.id);
        setTeacherEditModal(course.director_id)

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

            setCourseToDelete(null);
            toast.success("Curso eliminado correctamente.");
        } catch (dbError:any) {
            console.error("Error eliminando el curso", dbError);
            toast.error(dbError.response?.data?.message || "Error al eliminar el curso");
        } finally {
            setLoadingDelete(false);
        }
    }

    const handleShowOptions = (index: number, e: React.MouseEvent) => {
        if (indexOption === index) {
            setindexOption(null);
            return;
        }

        const clickY = e.clientY;
        const windowHeight = window.innerHeight;

        if (windowHeight - clickY < 250) {
            setMenuPosition('top');
        } else {
            setMenuPosition('bottom');
        }

        setindexOption(index);
    };

    if (loading && courses.length === 0) return <LoadingPage title="Cargando cursos..." />

    return (
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-3rem)] ">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4`}>
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-5 items-start md:items-center rounded-t-xl bg-white z-10">
                    <h2 className="text-xl font-bold text-custom-black">Cursos</h2>
                    <PrimaryButton
                        full={false}
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

                <div className="p-3 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
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
                                <div className={`w-10 h-10 shrink-0 rounded-full flex uppercase items-center justify-center font-bold text-sm ${
                                    activeCourseId === course.id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                                }`}>
                                    {course.course_name ? course.course_name.replace("-", "") : "CC"}
                                </div>
                                <div className="max-w-36 overflow-hidden">
                                    <h3 className={`font-bold text-base truncate ${activeCourseId === course.id ? 'text-primary-900' : 'text-custom-black'}`}>
                                        Curso <span className="uppercase">{course.course_name}</span>
                                    </h3>
                                    <p className="text-gray-500 text-xs truncate">
                                        {course.director_name || "Sin director"} • {course.student_count || 0} Est.
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowOptions(index, e);
                                }}
                                className="hover:bg-gray-100 cursor-pointer p-1.5 text-custom-black text-sm opacity-0 group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                <HiDotsVertical />
                            </button>
                            {indexOption === index && (
                                <ul
                                    ref={ref}
                                    className={`absolute z-50 w-48 h-fit p-2 text-sm md:text-base font-semibold right-4 bg-white text-custom-black shadow-lg border border-gray-100 rounded-xl ${
                                        menuPosition === 'top' ? 'bottom-12' : 'top-12'
                                    }`}
                                >
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
                                            onClick={() => setCourseToDelete(course)}
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
                    <Outlet key={activeCourseId} />
                ) : (
                    <div className="flex items-center justify-center flex-col text-gray-400 p-10">
                        <FaSchool className="text-4xl" />
                        <h3 className="text-xl font-medium text-gray-500">Selecciona un curso</h3>
                        <p className="text-sm mt-2">Haz clic en un curso de la lista para ver sus detalles, estudiantes y clases asignadas.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={courseToDelete !== null}
                onClose={() => setCourseToDelete(null)}
                onConfirm={async () => {
                    if (courseToDelete) {
                        await handleDeleteCourse(courseToDelete.id);
                    }
                }}
                title="¿Estas seguro?"
                loadingDelete={loadingDelete}
                message={`De eliminar el curso ${courseToDelete?.course_name}`}
            />

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
                    setTeacherEditModal(null);
                    setFormData({ name: "", year: new Date().getFullYear().toString(), teacherId: "" });
                }}
            />
        </div>
    );
}

export default PrincipalCourses;