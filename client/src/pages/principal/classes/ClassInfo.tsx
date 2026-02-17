import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/client.ts";
import { MdArrowBackIos } from "react-icons/md";
import { formateDate } from "../../../types";

interface Student {
    full_name: string;
    email: string;
    student_id: string;
}

interface ClassProps {
    details?: {
        id: string;
        class_name: string;
        subject_name: string;
        teacher_id: string;
        teacher_name: string;
        created_at: string;
    };
    students?: Student[];
}

export default function ClassInfo() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [classData, setClassData] = useState<ClassProps | null>(null);
    const [loading, setLoading] = useState(false);
    const[error, setError] = useState("");


    useEffect(() => {
        const fetchClassData = async () => {
            setLoading(true);

            try {
                const response = await api.get(`classes/${id}`);
                setClassData(response.data);
            } catch (error) {
                setError("No se pudieron cargar los detalles de la clase.");
                console.error("Error fetching class details:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchClassData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-shadow border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !classData || !classData.details || !classData.students) {
        return <p className="text-red-500 font-semibold p-6">{error || "Clase no encontrada"}</p>;
    }

    const { details, students } = classData;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate("/principal/classes")}
                    className="text-gray-500 ml-3 cursor-pointer hover:text-custom-black font-semibold text-xl md:text-2xl flex items-center transition-colors"
                >
                    <MdArrowBackIos />
                </button>

                <button className="bg-primary-shadow text-sm lg:text-base hover:bg-primary text-primary-darker hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
                    + Añadir Estudiante
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-custom-black">
                        Clase {details.class_name} - {details.subject_name}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Profesor</p>
                        <p className="font-semibold text-custom-black text-base lg:text-lg">{details.teacher_name}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Estudiantes Inscritos</p>
                        <p className="font-semibold text-custom-black text-base lg:text-lg">{students.length} Total</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Fecha de Creación</p>
                        <p className="font-semibold text-custom-black text-base lg:text-lg capitalize">{formateDate(details.created_at)}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg md:text-xl font-bold text-custom-black">Lista de Estudiantes</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-xl text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-sm lg:text-base font-semibold text-gray-600">Nombre Completo</th>
                            <th className="p-4 text-sm lg:text-base font-semibold text-gray-600">Correo Electrónico</th>
                            <th className="p-4 text-sm lg:text-base font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map((student) => (
                            <tr
                                key={student.student_id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-4 text-sm lg:text-base font-medium text-custom-black">
                                    {student.full_name}
                                </td>
                                <td className="p-4 text-sm lg:text-base text-gray-600">
                                    {student.email}
                                </td>
                                <td className="p-4 text-sm lg:text-base text-right">
                                    <button className="text-red-500 hover:text-red-700 font-semibold text-sm mr-4 cursor-pointer">
                                        Remover
                                    </button>
                                    <button className="text-primary-600 hover:text-primary-800 font-semibold text-sm lg:text-base cursor-pointer">
                                        Ver Perfil
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {students.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500 font-medium">
                                    No hay estudiantes inscritos en esta clase todavía.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}