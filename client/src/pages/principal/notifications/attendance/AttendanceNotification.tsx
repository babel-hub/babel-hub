import { useEffect, useState } from 'react';
import api from "../../../../api/client.ts";
import {LoadingPage} from "../../../../components/Loadings.tsx";

interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface AttendanceSummary {
    course_id: string;
    course_name: string;
    student_id: string;
    student_name: string;
    total_absences: number;
    total_lates: number;
}

export default function AttendanceCenter() {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    const [summaryData, setSummaryData] = useState<AttendanceSummary[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("all");

    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await api.get('/periods');
                const fetchedPeriods = response.data;
                setPeriods(fetchedPeriods);

                if (fetchedPeriods.length > 0) {
                    setSelectedPeriod(fetchedPeriods[0]);
                }
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar los periodos académicos.");
            } finally {
                setLoading(false);
            }
        };

        fetchPeriods();
    }, []);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!selectedPeriod) return;

            setFetchingData(true);
            try {
                const response = await api.get(`/attendance/summary?startDate=${selectedPeriod.start_date}&endDate=${selectedPeriod.end_date}`);
                setSummaryData(response.data);
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar el resumen de asistencia.");
            } finally {
                setFetchingData(false);
            }
        };

        fetchSummary();
    }, [selectedPeriod]);

    const uniqueCourses = Array.from(new Set(summaryData.map(item => item.course_name))).sort();

    const filteredData = selectedCourse === "all"
        ? summaryData
        : summaryData.filter(item => item.course_name === selectedCourse);

    if (loading) return <LoadingPage title="Cargando..." />;

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-custom-black">Centro de Asistencia</h1>
                    <p className="text-gray-500 mt-1 text-sm">Monitorea inasistencias y llegadas tarde por periodo académico.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Periodo</label>
                        <select
                            className="bg-gray-50 border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                            value={selectedPeriod?.id || ""}
                            onChange={(e) => {
                                const period = periods.find(p => p.id === e.target.value);
                                setSelectedPeriod(period || null);
                            }}
                        >
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                            {periods.length === 0 && <option value="">Sin periodos</option>}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filtrar Curso</label>
                        <select
                            className="bg-gray-50 border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="all">Todos los Cursos</option>
                            {uniqueCourses.map(course => (
                                <option key={course} value={course}>Curso {course}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg font-medium">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                {fetchingData && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                            <th className="p-4 text-sm font-semibold pl-6">Estudiante</th>
                            <th className="p-4 text-sm font-semibold">Curso</th>
                            <th className="p-4 text-sm font-semibold text-center">Inasistencias</th>
                            <th className="p-4 text-sm font-semibold text-center pr-6">Llegadas Tarde</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((record) => {
                                const absences = Number(record.total_absences);
                                const lates = Number(record.total_lates);

                                return (
                                    <tr key={record.student_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-medium text-custom-black">
                                            {record.student_name}
                                        </td>
                                        <td className="p-4">
                                                <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded text-xs border border-gray-200">
                                                    {record.course_name}
                                                </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            {absences > 0 ? (
                                                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-bold ${
                                                    absences >= 3
                                                        ? 'bg-red-100 text-red-700 border border-red-200' // 🌟 Alert state!
                                                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                }`}>
                                                        {absences}
                                                    </span>
                                            ) : (
                                                <span className="text-gray-300 font-medium">-</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center pr-6">
                                            {lates > 0 ? (
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                        {lates}
                                                    </span>
                                            ) : (
                                                <span className="text-gray-300 font-medium">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-gray-500">
                                    No hay registros de asistencia para el periodo seleccionado.
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