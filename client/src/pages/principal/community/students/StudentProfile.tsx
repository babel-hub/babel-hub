import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../../api/client.ts";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";

interface GradeRecord {
    assignment_id: string;
    assignment_title: string;
    class_name: string;
    grade_value: number;
    graded_at: string;
}

interface StudentProfileData {
    id: string;
    full_name: string;
    email: string;
    course_name: string;
    enrollment_code: string;
    recent_grades: GradeRecord[];
    // You can add attendance stats here later
}

export default function StudentProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<StudentProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get(`/student/${id as string}`);
                setData(response.data);
                console.log(response.data);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Cargando perfil...</div>;
    if (!data) return <div className="p-6 text-red-500">Estudiante no encontrado.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    <ButtonChevronBack onClick={() => navigate(-1)} />
                    <div className="w-16 h-16 bg-primary-shadow text-primary rounded-full flex items-center justify-center text-2xl font-bold">
                        {data.full_name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-custom-black">{data.full_name}</h1>
                        <p className="text-gray-500">{data.email} | Código: {data.enrollment_code}</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                        Curso: {data.course_name}
                    </span>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">Calificaciones Recientes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                            <th className="p-3 font-semibold text-custom-black">Materia</th>
                            <th className="p-3 font-semibold text-custom-black">Asignación</th>
                            <th className="p-3 font-semibold text-custom-black">Nota</th>
                            <th className="p-3 font-semibold text-custom-black">Fecha</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.recent_grades.map((grade) => (
                            <tr key={grade.assignment_id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 font-medium text-black">{grade.class_name}</td>
                                <td className="p-3 text-gray-600">{grade.assignment_title}</td>
                                <td className="p-3">
                                    <span className={`font-bold ${grade.grade_value >= 4.0 ? 'text-green-600' : grade.grade_value >= 3.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {grade.grade_value.toFixed(1)}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-500 text-sm">{new Date(grade.graded_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {data.recent_grades.length === 0 && (
                        <p className="text-gray-500 text-center py-6">No hay asignaciones creadas todavía.</p>
                    )}
                </div>
            </div>
        </div>
    );
}