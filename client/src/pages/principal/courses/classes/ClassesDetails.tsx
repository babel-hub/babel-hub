import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../../../../api/client.ts";
import { useNavigate } from "react-router-dom";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import PrimaryButton from "../../../../components/PrimaryButton.tsx";
import LoadingContent from "../../../../components/LoadingContent.tsx";

interface Assignment {
    id: string;
    title: string;
    type: string;
    due_date: string;
}

interface Student {
    student_id: string;
    full_name: string;
    email: string;
}

interface ClassDetailsData {
    details: {
        id: string;
        class_name: string;
        course_name: string;
        subject_name: string;
        teacher_name: string;
    };
    students: Student[];
    assignments: Assignment[];
}

export default function ClassDetails() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<ClassDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await api.get(`/classes/${id}`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching class:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchClass();
    }, [id]);

    if (loading) return <LoadingContent title="Cargando clase..."/>;
    if (!data) return <div className="p-6 text-red-500">Clase no encontrada.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex gap-2 items-center">
                        <ButtonChevronBack onClick={() => navigate(-1)} />
                        <h1 className="text-xl md:text-2xl font-bold text-custom-black">
                            {data.details.subject_name} <span className="text-gray-400 font-normal">| {data.details.course_name}</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1">Profesor: {data.details.teacher_name}</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <PrimaryButton title="Nueva Asignación"/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">Asignaciones (Tareas y Exámenes)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.assignments.map((assignment) => (
                            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-custom-black">{assignment.title}</h3>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md uppercase">
                                        {assignment.type}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Entrega: {new Date(assignment.due_date).toLocaleDateString()}
                                </p>
                                <button className="mt-4 text-sm text-primary-600 font-medium hover:underline w-full text-left">
                                    Ver Calificaciones →
                                </button>
                            </div>
                        ))}
                    </div>

                    {data.assignments.length === 0 && (
                        <p className="text-gray-500 text-center py-6">No hay asignaciones creadas todavía.</p>
                    )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-custom-black mb-4 border-b pb-2">
                        Estudiantes ({data.students.length})
                    </h2>
                    <div className="overflow-y-auto max-h-[400px]">
                        <ul className="divide-y divide-gray-100">
                            {data.students.map((student) => (
                                <li key={student.student_id} className="py-2 flex flex-col justify-center">
                                    <span className="font-medium text-sm text-custom-black">{student.full_name}</span>
                                    <span className="text-xs text-gray-500">{student.email}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}