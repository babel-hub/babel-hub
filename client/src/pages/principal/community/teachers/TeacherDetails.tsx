import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../../api/client.ts";
import { LoadingContent } from "../../../../components/Loadings.tsx";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import {formateDate, getInitials} from "../../../../types";

interface ClassItem {
    class_id: string;
    subject_name: string;
    course_name: string;
}

interface TeacherProfileData {
    teacher_id: string;
    created_at: string;
    full_name: string;
    email: string;
    classes: ClassItem[];
}

export default function TeacherDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [teacher, setTeacher] = useState<TeacherProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/teacher/${id}`);
                setTeacher(response.data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || "Error al cargar el perfil del profesor.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTeacherProfile();
        }
    }, [id]);

    if (loading) return <LoadingContent title="Cargando perfil del profesor..." />;
    if (error) return <div className="p-6 text-red-500 font-semibold">{error}</div>;
    if (!teacher) return <div className="p-6 text-gray-500">Profesor no encontrado.</div>;

    return (
        <div className="space-y-5">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <ButtonChevronBack onClick={() => navigate(-1)} />

                    <div className="flex items-center gap-5 w-full">
                        <div className="w-20 h-20 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-3xl shadow-inner">
                            {getInitials(teacher.full_name)}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-custom-black">
                                {teacher.full_name}
                            </h1>
                            <p className="text-gray-500 mt-1">{teacher.email}</p>

                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                <span className="bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                                    Contratado/a: {formateDate(teacher.created_at)}
                                </span>
                                <span className="bg-indigo-50 text-indigo-700 font-medium px-3 py-1.5 rounded-lg border border-indigo-100">
                                    {teacher.classes.length} Clases Asignadas
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-custom-black">Horario / Clases Asignadas</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Materias que este profesor dicta actualmente.
                    </p>
                </div>

                {teacher.classes.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500 font-medium text-lg">Este profesor no tiene clases asignadas.</p>
                        <p className="text-sm mt-1 text-gray-400">Puedes asignarle clases desde la vista de Cursos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                                <th className="p-4 text-sm font-semibold pl-6">Materia</th>
                                <th className="p-4 text-sm font-semibold">Curso</th>
                                <th className="p-4 text-sm font-semibold text-right pr-6">Acción</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {teacher.classes.map((cls) => (
                                <tr key={cls.class_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 pl-6 font-medium text-custom-black">
                                        {cls.subject_name}
                                    </td>
                                    <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded text-xs border border-gray-200">
                                                {cls.course_name}
                                            </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button
                                            disabled={true}
                                            onClick={() => navigate(`/principal/clase/${cls.class_id}`)}
                                            className="text-sm font-semibold text-gray-300 cursor-not-allowed transition-colors"
                                        >
                                            Ver Clase
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}