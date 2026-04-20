import {Fragment, useEffect, useMemo, useState} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../../../api/client.ts";
import {LoadingPage} from "../../../../components/Loadings.tsx";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import StudentCalendarCard from "../../../../components/StudentCalendarCard.tsx";
import {getInitials, reverseName} from "../../../../types";

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
                <div className="flex grow gap-3 items-center">
                    <ButtonChevronBack onClick={() => navigate(-1)}/>
                    <div>
                        <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">Asistencias</h1>
                        <p className="text-gray-400 mt-1 text-sm">Monitorea las inasistencias y llegadas tarde</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                    <div className="flex w-full lg:w-auto flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">filtrar Periodo</label>
                        <select
                            className="bg-gray-50 w-full text-sm md:text-base appearance-none border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
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

                    <div className="flex w-full lg:w-auto flex-col">
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

            <div className="bg-white flex flex-col gap-5 rounded-xl p-3 md:p-5 shadow-sm border border-gray-100 overflow-hidden relative">
                {fetchingData && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {
                    filteredData.length > 0 ? (
                        displayedCourses.map((course) => (
                            <div key={course} className="mb-8">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-6 rounded-full bg-primary" />
                                        <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
                                            {course}
                                        </span>
                                    </div>

                                    {filteredData.map((student, index) => {
                                        const absences = Number(student.total_absences);
                                        const lates = Number(student.total_lates);
                                        const isOpen = openIndex === index;

                                        return (
                                            student.course_name === course && (
                                                <Fragment key={student.student_id}>
                                                    <button
                                                        onClick={() => handleToggle(student, index)}
                                                        className={`group py-3 px-4 cursor-pointer transition-all duration-200 w-full border flex items-center justify-between rounded-2xl
                                                            ${isOpen ? 
                                                                absences >= 2 ? 'border-red-error shadow-md' : 'border-primary shadow-md' :
                                                                absences >= 2 ? 'border-red-error hover:shadow-sm' : 'border-gray-100 bg-white hover:border-primary hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex items-center min-w-0 gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                                                ${isOpen ?
                                                                    (absences >= 2) ? 'bg-red-error text-white' : 'bg-primary text-white' :
                                                                    (absences >= 2) ? 'bg-red-shadow text-red-error' : 'bg-primary-shadow text-primary'
                                                            }`}>
                                                                {getInitials(student.student_name)}
                                                            </div>
                                                            <p className={`text-sm md:text-base leading-tight max-w-40 sm:max-w-full text-left capitalize font-semibold transition-colors 
                                                                ${isOpen ? 
                                                                    absences >= 2 ? 'text-gray-900' : 'text-gray-900' :
                                                                    absences >= 2 ?  'text-gray-700 group-hover:text-red-error' :  'text-gray-700 group-hover:text-primary'
                                                            }`}>
                                                                {reverseName(student.student_name)}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${lates > 0 ? 'bg-yellow-50 text-yellow-600' : 'text-gray-300'}`}>
                                                                    {lates}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-col items-end border-l pl-4 border-gray-100">
                                                                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                                                    absences > 0 ? 'bg-red-50 text-red-500' : 'text-gray-300'
                                                                }`}>
                                                                    {absences}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {isOpen && selectedPeriod && (
                                                        <div className="p-1 rounded-xl bg-primary-shadow/30 ring-1 ring-primary/20">
                                                            <div className="bg-white rounded-xl shadow-inner">
                                                                <StudentCalendarCard
                                                                    studentId={student.student_id}
                                                                    period={selectedPeriod}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Fragment>
                                            )
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 sm:py-14 lg:py-20 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm font-medium">No hay resultados</p>
                        </div>
                    )
                }
            </div>
        </div>
    );
}