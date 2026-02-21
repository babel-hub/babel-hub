import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../api/client.ts";
import ButtonChevronBack from "../../../components/ButtonChevrowBack.tsx";



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

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await api.get(`/courses/${id}`);
                setData(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

    if (loading) return <div className="w-10 h-10 border-4 mx-auto border-primary-shadow border-t-primary-darker rounded-full animate-spin"></div>;
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
                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100">
                        + Añadir Estudiante
                    </button>
                    <button className="bg-primary-shadow text-primary-darker px-4 py-2 rounded-lg font-medium hover:bg-primary">
                        + Asignar Clase
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">
                        Estudiantes ({data.students.length})
                    </h2>
                    <div className="overflow-y-auto max-h-[400px]">
                        <ul className="divide-y divide-gray-100">
                            {data.students.map((student) => (
                                <li key={student.student_id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg">
                                    <div>
                                        <p className="font-medium text-custom-black">{student.full_name}</p>
                                        <p className="text-sm text-gray-500">{student.email}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/principal/comunidad/estudiantes/${student.student_id}`)}
                                        className="text-primary-600 text-sm font-medium hover:underline">
                                        Ver Perfil
                                    </button>
                                </li>
                            ))}
                            {data.students.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No hay estudiantes en este curso.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">
                        Clases Asignadas ({data.classes.length})
                    </h2>
                    <div className="overflow-y-auto max-h-[500px]">
                        <ul className="divide-y divide-gray-100">
                            {data.classes.map((cls) => (
                                <li key={cls.class_id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg">
                                    <div>
                                        <p className="font-medium text-custom-black">{cls.subject_name}</p>
                                        <p className="text-sm text-gray-500">Prof: {cls.teacher_name}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`clase/${cls.class_id}`)}
                                        className="text-primary-600 text-sm font-medium hover:underline">
                                        Ver Clase
                                    </button>
                                </li>
                            ))}
                            {data.classes.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No hay clases asignadas a este curso.</p>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}