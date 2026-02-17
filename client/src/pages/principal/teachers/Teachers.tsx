import api from "../../../api/client.ts";
import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading.tsx";
import { formateDate } from "../../../types";
import PrimaryButton from "../../../components/Button.tsx";

interface Teacher {
    id: string;
    user_id: string;
    created_at: string;
    full_name: string;
    email: string;
    total_classes: number;
}

const ListTeacher = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);

            try {
                const response = await api.get("/teacher");
                setTeachers(response.data.result || response.data);
            } catch (fetchError) {
                console.log(fetchError);
                setError("Error fetching teachers");
            } finally {
                setLoading(false);
            }
        }

        fetchTeachers();
    }, []);

    const getInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return ( <Loading title="Cargando Profesores" /> );
    }

    if (error) {
        return <p className="text-red-500 font-semibold p-6 bg-red-50 rounded-xl">{error}</p>;
    }

    return (
        <div className="flex flex-col gap-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-custom-black">Profesores</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {teachers.length} profesores registrados en el sistema.
                    </p>
                </div>
                <PrimaryButton title="+ Nuevo Profesor"/>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((teacher) => (
                    <div
                        key={teacher.id}
                        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-lg">
                                {getInitials(teacher.full_name)}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-custom-black text-lg truncate" title={teacher.full_name}>
                                    {teacher.full_name}
                                </h3>
                                <p className="text-gray-500 text-sm truncate" title={teacher.email}>
                                    {teacher.email}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-col gap-3">
                            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100">
                                <span className="text-gray-600 font-medium text-sm">Clases Asignadas</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-custom-black text-lg">{teacher.total_classes || 0}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm px-1">
                                <span className="text-gray-500 font-medium">Contratado/a:</span>
                                <span className="text-gray-700 font-medium">{formateDate(teacher.created_at)}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button className="text-sm font-semibold text-gray-500 hover:text-custom-black transition-colors px-2 py-1 cursor-pointer">
                                Editar
                            </button>
                            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 cursor-pointer">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTeachers.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                    <p className="text-gray-500 font-medium text-lg">No se encontraron profesores.</p>
                </div>
            )}

        </div>
    );
}

export default ListTeacher;