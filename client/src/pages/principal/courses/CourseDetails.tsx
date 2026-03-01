import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../api/client.ts";
import ButtonChevronBack from "../../../components/ButtonChevrowBack.tsx";
import { LoadingContent } from "../../../components/Loadings.tsx";
import { PrimaryButton } from "../../../components/Buttons.tsx";
import DynamicModalForm, {type FormField} from "../../../components/ModalForm.tsx";

interface Student {
    student_id: string;
    full_name: string;
    email: string;
}

interface ClassItem {
    class_id: string;
    class_name: string;
    subject_name: string;
    teacher_name: string;
}

interface CourseData {
    course: {
        id: string;
        name: string;
        created_at: string;
        year: string | number;
    };
    students: Student[];
    classes: ClassItem[];
}

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        courseId: id,
        subjectId: "",
        teacherId: ""
    });

    const assignClassFields: FormField[] = [
        {
            name: "courseId",
            label: "Curso",
            type: "text",
            disabled: true,
        },
        {
            name: "subjectId",
            label: "Materia",
            type: "select",
            required: true,
            options: subjects.map(s => ({ value: s.id, label: s.name }))
        },
        {
            name: "teacherId",
            label: "Profesor",
            type: "select",
            required: true,
            options: teachers.map(t => ({ value: t.id, label: t.full_name }))
        }
    ];

    const fetchCourseDetails = async () => {
        try {
            const response = await api.get(`/courses/${id}`);
            console.log(response)
            setData(response.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id])

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const subjectsResponse = await api.get(`/subjects`);
                setSubjects(subjectsResponse.data.subjects || subjectsResponse.data);
                console.log(subjectsResponse.data.subjects);

                const teachersResponse = await api.get(`/teacher`);
                setTeachers(teachersResponse.data.teachers || teachersResponse.data);

            } catch (err) {
                setFormError("Error cargando los datos del formulario.");
            }
        }

        if (isModalOpen && subjects.length === 0 && teachers.length === 0) {
            fetchDropdownData();
        }
    }, [isModalOpen]);

    const handleAssignClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            await api.post("/classes", formData);
            setIsModalOpen(false);
            setFormData({ courseId: id,  subjectId: "", teacherId: "" });
            await fetchCourseDetails();
        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al asignar la clase.");
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

    if (loading) return <LoadingContent title="Cargando curso..."/>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!data) return <div className="p-6">No se encontró el curso.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex flex-row gap-2 items-center">
                        <ButtonChevronBack onClick={() => navigate(-1)}/>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-custom-black">
                            curso: {data.course.name}
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1">Año Lectivo: {data.course.year}</p>
                </div>
                <div className="mt-4 md:mt-0 space-x-3">
                    <PrimaryButton onClick={() => setIsModalOpen(true)} title="Asignar clase"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">
                        Clases Asignadas ({data.classes.length})
                    </h2>
                    <div className="overflow-y-auto max-h-[400px]">
                        <ul className="divide-y divide-gray-100">
                            {data.classes.map((cls) => (
                                <li key={cls.class_id}>
                                    <button
                                        onClick={() => navigate(`clase/${cls.class_id}`)}
                                        className="py-3 cursor-pointer flex w-full justify-start items-center hover:bg-gray-50 px-2 rounded-lg"
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-custom-black">{cls.subject_name}</p>
                                            <p className="text-sm text-gray-500">Profe: {cls.teacher_name}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                            {data.classes.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No hay clases asignadas a este curso.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="bg-white lg:col-span-2 rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">
                        Estudiantes ({data.students.length})
                    </h2>
                    <div className="overflow-y-auto h-fit max-h-[400px]">
                        <ul className="divide-y divide-gray-100">
                            {data.students.map((student) => (
                                <li key={student.student_id}>
                                    <button
                                        onClick={() => navigate(`/principal/comunidad/estudiantes/${student.student_id}`)}
                                        className="py-3 cursor-pointer flex w-full justify-between items-center hover:bg-gray-50 px-2 rounded-lg"
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-custom-black">{student.full_name}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                            {data.students.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No hay estudiantes en este curso.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <DynamicModalForm
                    isOpen={isModalOpen}
                    title="Asignar Clase"
                    fields={assignClassFields}
                    formData={{...formData, courseId: data?.course.name || formData.courseId }}
                    formError={formError}
                    formLoading={formLoading}
                    onChange={handleFormChange}
                    onSubmit={handleAssignClass}
                    onClose={() => {
                        setIsModalOpen(false);
                        setFormError("");
                        setFormData({ courseId: id, teacherId: "", subjectId: "" });
                    }}
                />

            </div>
        </div>
    );
}