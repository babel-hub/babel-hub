import {useEffect, useMemo, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../../../api/client.ts";
import {LoadingPage} from "../../../../components/Loadings.tsx";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import StudentCalendarCard from "../../../../components/StudentCalendarCard.tsx";

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
    const [params] = useSearchParams();
    const courseParams = params.get('course')
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    const [summaryData, setSummaryData] = useState<AttendanceSummary[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>( courseParams || "all");

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(false);

    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await api.get('/periods');
                const fetchedPeriods = response.data.periods || response.data;
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

            const today = new Date();
            const initialDate = new Date(selectedPeriod.start_date);

            if (today < initialDate) {
                setSummaryData([]);
                return;
            }

            const todayStr = today.toISOString().split('T')[0];
            const periodEndStr = selectedPeriod.end_date.split('T')[0];
            const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

            try {
                setFetchingData(true);
                const response = await api.get(`/attendance/summary?startDate=${selectedPeriod.start_date}&endDate=${effectiveEndDate}`);
                setSummaryData(response.data.attendanceSummary || response.data);
            } catch (err: any) {
                console.error(err);
                setError("Error al cargar el resumen de asistencia.");
            } finally {
                setFetchingData(false);
            }
        };

        fetchSummary();
    }, [selectedPeriod]);

    const handleToggle = (student: AttendanceSummary, index: number) => {
        if (student.student_id) {
            setOpenIndex(openIndex === index ? null : index);
        }
    };

    const uniqueCourses = useMemo(() => {
        return Array.from(new Set(summaryData.map(item => item.course_name))).sort();
    }, [summaryData]);

    const filteredData = selectedCourse === "all"
        ? summaryData
        : summaryData.filter(item => item.course_name === selectedCourse);

    const displayedCourses = selectedCourse === "all"
        ? uniqueCourses
        : [selectedCourse];

    if (loading) return <LoadingPage title="Cargando..." />;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex gap-3 items-center">
                    <ButtonChevronBack onClick={() => navigate(-1)}/>
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-custom-black">Asistencias</h1>
                        <p className="text-gray-400 mt-1 text-sm">Monitorea las inasistencias y llegadas tarde</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">filtrar Periodo</label>
                        <select
                            className="bg-gray-50 text-sm md:text-base appearance-none border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
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
                            className="bg-gray-50 text-sm md:text-base appearance-none border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
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

            <div className="bg-white flex flex-col gap-5 rounded-xl p-5 shadow-sm border border-gray-100 overflow-hidden relative">
                {fetchingData && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {
                    filteredData.length > 0 ? (
                        displayedCourses.map((course) => (
                            <div key={course}>
                                <div className="flex flex-col gap-2">
                                    <span className="font-semibold text-sm md:text-base px-2 py-1 rounded-lg bg-gray-100 self-start
                                     text-gray-600">{course}</span>
                                    {
                                        filteredData.map((student, index) => {
                                            const absences = Number(student.total_absences);
                                            const lates = Number(student.total_lates);

                                            return (
                                                (student.course_name === course) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggle(student, index)}
                                                            key={student.student_id}
                                                            className="py-2 px-3 cursor-pointer w-full border border-gray-200 flex items-center justify-between bg-white rounded-xl"
                                                        >
                                                            <p className="text-sm md:text-base">{student.student_name}</p>
                                                            <div className="flex items-center gap-5">
                                                                {lates > 0 ? (
                                                                    <span className="inline-flex text-xs md:text-sm items-center justify-center px-2 md:px-2.5 py-1 rounded-full font-bold bg-yellow-100 text-yellow-700">
                                                                        {lates}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-700 bg-gray-100 text-xs md:text-sm px-2.5 md:px-3 py-1 rounded-full font-medium">-</span>
                                                                )}

                                                                {absences > 0 ? (
                                                                    <span className={`inline-flex items-center justify-center px-2 md:px-2.5 py-1 rounded-full text-xs md:text-sm font-bold ${
                                                                        absences >= 2
                                                                            ? 'bg-red-300 text-red-700 animate-pulse'
                                                                            : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                        {absences}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-700 bg-gray-100 text-xs md:text-sm px-2.5 md:px-3 py-1 rounded-full font-medium">-</span>
                                                                )}
                                                            </div>
                                                        </button>
                                                        {student.student_id && openIndex === index && selectedPeriod && (
                                                            <div className="border border-gray-200 w-full rounded-xl z-0 relative">
                                                                <StudentCalendarCard
                                                                    studentId={student.student_id}
                                                                    period={selectedPeriod}
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 flex flex-col items-center justify-center">
                            <p className="text-sm md:text-base font-semibold text-custom-black">Sin resultados</p>
                        </div>
                    )
                }
            </div>
        </div>
    );
}