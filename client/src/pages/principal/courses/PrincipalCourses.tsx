import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import api from "../../../api/client.ts";
import PrimaryButton from "../../../components/PrimaryButton.tsx";
import Loading from "../../../components/Loading.tsx";

interface ClassData {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    student_count: string;
}


const PrincipalCourses = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<ClassData[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadClasses = async () => {
            setLoading(true);

            try {
                const response = await api.get("/courses");
                setCourses(response.data.courses);
            } catch (loadError) {
                console.error("Failed to load courses", loadError);
                setError("No se pudieron cargar las clases.");
            } finally {
                setLoading(false);
            }
        }

        loadClasses();
    }, [])

    if (loading) return <Loading title="Cargando cursos..." />

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-custom-black">Gestión de Cursos</h2>
                <PrimaryButton title="Nuevo Curso"/>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto">
                <table className="w-full min-w-xl text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 font-semibold text-custom-black">Curso</th>
                        <th className="p-3 font-semibold text-custom-black">Año</th>
                        <th className="p-3 font-semibold text-custom-black">Estudiantes</th>
                        <th className="p-3 font-semibold text-custom-black">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map((course) => (
                        <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-medium text-black">{course.course_name}</td>
                            <td className="p-3 text-custom-black">{course.year}</td>
                            <td className="p-3 text-custom-black">{course.student_count}</td>

                            <td className="p-3">
                                <button
                                    onClick={() => navigate(`/principal/cursos/${course.id}`)}
                                    className="text-primary-600 hover:underline mr-3 cursor-pointer">
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    ))}

                    {courses.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-500">
                                No hay cursos registrados.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PrincipalCourses;