import api from "../../../api/client.ts";
import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading.tsx";
import { formateDate } from "../../../types";
import PrimaryButton from "../../../components/Button.tsx";

interface StudentProps {
    id: string;
    enrollment_code: string;
    full_name: string;
    created_at: string;
    email: string;
}

const ListStudents = () => {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [students, setStudents] = useState<StudentProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);

            try {
                const response = await api.get("/student");
                setStudents(response.data);
            } catch (fetchError) {
                console.log(fetchError);
                setError("Error fetching students");
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, []);

    const getInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.enrollment_code && student.enrollment_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if(loading) {
        return (<Loading title="Cargando Estudiantes..."/>);
    }

    if (error) {
        return <p className="text-red-500 font-semibold p-6">{error || "Clase no encontrada"}</p>;
    }

    return (
        <div className="flex flex-col gap-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-custom-black">Estudiantes</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {students.length} estudiantes registrados en el sistema.
                    </p>
                </div>

                <PrimaryButton title="+ Nuevo Estudiante"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                {getInitials(student.full_name)}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-custom-black text-lg truncate" title={student.full_name}>
                                    {student.full_name}
                                </h3>
                                <p className="text-gray-500 text-sm truncate" title={student.email}>
                                    {student.email}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Código:</span>
                                {student.enrollment_code ? (
                                    <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">
                                        {student.enrollment_code}
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded text-xs">
                                        Pendiente
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Registro:</span>
                                <span className="text-gray-700 font-medium">{formateDate(student.created_at)}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button className="text-sm font-semibold text-gray-500 hover:text-custom-black transition-colors px-2 py-1 cursor-pointer">
                                Editar
                            </button>
                            <button className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors px-2 py-1 cursor-pointer">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                    <p className="text-gray-500 font-medium text-lg">No se encontraron estudiantes.</p>
                    <p className="text-sm mt-1 text-gray-400">Intenta buscar con otros términos.</p>
                </div>
            )}

        </div>
    );
}

export default ListStudents