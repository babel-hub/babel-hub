import {memo, useCallback, useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../../api/client.ts";
import ButtonChevronBack from "../../../../components/ButtonChevrowBack.tsx";
import { PrimaryButton } from "../../../../components/Buttons.tsx";
import { LoadingContent } from "../../../../components/Loadings.tsx";
import {formatDate, formatterDate, getInitials, reverseName} from "../../../../types";
import toast from "react-hot-toast";
import {HiOutlineCalendar, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUsers} from "react-icons/hi";

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

interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
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

const StudentAttendanceRow = memo(function StudentAttendanceRow({
    student,
    status,
    onUpdate
                                            }:{
    student: Student;
    status: string;
    onUpdate: (id: string, status: 'present' | 'absent' | 'late') => void
}) {
    return (
        <li key={student.student_id} className="p-4 flex flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                    {getInitials(student.full_name)}
                </div>
                <span className="font-medium capitalize text-sm md:text-base text-custom-black leading-tight">
                    {reverseName(student.full_name)}
                </span>
            </div>

            <div className="flex p-1 shrink-0">
                <button
                    onClick={() => onUpdate(student.student_id, 'present')}
                    className={`px-2 py-1.5 rounded-md transition-all`}
                >
                    <span className={`border-2 w-4 h-4 rounded-full block ${status === 'present' ? 'bg-green-600 border-green-600' : 'bg-transparent border-gray-600'}`}></span>
                </button>
                <button
                    onClick={() => onUpdate(student.student_id, 'late')}
                    className={`px-2 py-1.5 rounded-md transition-all}`}
                >
                    <span className={`border-2 w-4 h-4 rounded-full block ${status === 'late' ? 'bg-yellow-400 border-yellow-400' : 'bg-transparent border-gray-600'}`}></span>
                </button>
                <button
                    onClick={() => onUpdate(student.student_id, 'absent')}
                    className={`px-2 py-1.5 rounded-md transition-all'}`}
                >
                    <span className={`border-2 w-4 h-4 rounded-full block ${status === 'absent' ? 'bg-red-600 border-red-600' : 'bg-transparent border-gray-600'}`}></span>
                </button>
            </div>
        </li>
    )
});

export default function ClassDetails() {
    const { id, courseId } = useParams<{ id: string, courseId: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<ClassDetailsData | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'register attendance' | 'see attendance'>('students');

    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const date = formatterDate.format(new Date());
    const [attendanceDate, setAttendanceDate] = useState(date);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
    const [calendarDates, setCalendarDates] = useState<string[]>([]);
    const [attendanceGrid, setAttendanceGrid] = useState<any[]>([]);
    const [loadingGrid, setLoadingGrid] = useState(false);

    useEffect(() => {
        const fetchClass = async () => {
            setLoading(true);

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

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!data || activeTab !== 'register attendance') return;

            try {
                setLoadingAttendance(true);
                const response = await api.get(`/attendance/class/${id}?date=${attendanceDate}`);

                const fetchedRecords = response.data.records;
                const newRecordsMap: Record<string, string> = {};

                data.students.forEach(student => {
                    const existingRecord = fetchedRecords.find((r: any) => r.student_id === student.student_id);
                    newRecordsMap[student.student_id] = existingRecord?.status ?? 'present';
                });

                setAttendanceRecords(newRecordsMap);
            } catch (error) {
                console.error("Error fetching attendance:", error);
            } finally {
                setLoadingAttendance(false);
            }
        };

        fetchAttendance();
    }, [activeTab, attendanceDate, id, data]);

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
            } finally {
                setLoading(false);
            }
        };

        fetchPeriods();
    }, []);

    useEffect(() => {
        const fetchCourseAttendanceByClass = async () => {
            if (!selectedPeriod || activeTab !== 'see attendance') return;

            const today = new Date();
            const periodStart = new Date(selectedPeriod.start_date);

            if (today < periodStart) {
                setAttendanceGrid([]);
                setCalendarDates([]);
                return;
            }
            const todayStr = today.toISOString().split('T')[0];
            const periodEndStr = selectedPeriod.end_date.split('T')[0];
            const effectiveEndDate = todayStr < periodEndStr ? todayStr : periodEndStr;

            try {
                setLoadingGrid(true);
                const response = await api.get(`/attendance/course/${courseId}/class/${id}?startDate=${selectedPeriod.start_date}&endDate=${effectiveEndDate}`);
                const rawData = response.data.attendanceClass;

                const datesSet = new Set<string>();
                const studentMap = new Map();

                rawData.forEach((row: any) => {
                    datesSet.add(row.date);

                    if (!studentMap.has(row.student_id)) {
                        studentMap.set(row.student_id, {
                            student_id: row.student_id,
                            name: row.name,
                            records: []
                        });
                    }
                    studentMap.get(row.student_id).records.push({ date: row.date, status: row.status });
                });

                setCalendarDates(Array.from(datesSet).sort());
                setAttendanceGrid(Array.from(studentMap.values()));
            } catch (dbError) {
                console.error(dbError);
            } finally {
                setLoadingGrid(false);
            }
        }

        fetchCourseAttendanceByClass();
    }, [selectedPeriod, activeTab, courseId, id]);

    const handleSaveAttendance = async () => {
        if (data?.students.length === 0) {
            toast.error("La clase no tiene estudiantes.");
            return;
        }

        setSavingAttendance(true);

        try {
            const recordsArray = Object.entries(attendanceRecords).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await api.post(`/attendance/class/${id}/bulk`, {
                date: attendanceDate,
                records: recordsArray
            });

            toast.success("Asistencia guardada correctamente.");
        } catch (error) {
            const msg = "Error al guardar la asistencia."
            console.error(msg, error);
            toast.error(msg);
        } finally {
            setSavingAttendance(false);
        }
    };

    const updateStudentStatus = useCallback((id: string, status: 'present' | 'absent' | 'late') => {
        setAttendanceRecords(prev => ({...prev, [id]: status }));
    }, []);

    if (loading) return <LoadingContent title="Cargando clase..."/>;
    if (!data) return <div className="p-6 text-gray-500 text-center flex-1">Clase no encontrada.</div>;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col p-5 md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center">
                        <ButtonChevronBack onClick={() => navigate(-1)} />
                        <div>
                            <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">
                                {data.details.subject_name}
                                <span className="text-gray-400 font-normal ml-2">| {data.details.course_name}</span>
                            </h1>
                            <p className="text-gray-500 mt-1 text-xs md:text-sm">
                                Profesor: <span className="font-medium text-gray-700">{data.details.teacher_name}</span>
                            </p>
                        </div>
                    </div>
                    {activeTab === 'assignments' && <PrimaryButton title="Nueva Asignación"/>}
                    {activeTab === 'register attendance' && (
                        <PrimaryButton
                            onClick={handleSaveAttendance}
                            disabled={savingAttendance}
                            title={savingAttendance ? "Guardando..." : "Guardar Asistencia"}
                        />
                    )}
                    {activeTab === 'see attendance' && (
                        <select
                            className="bg-gray-50 self-end text-sm md:text-base appearance-none border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
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
                    )}
                </div>

                <div className="flex overflow-x-auto bg-white w-full no-scrollbar">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'students' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineUsers className="text-lg" /> Estudiantes
                    </button>
                    <button
                        onClick={() => setActiveTab('register attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'register attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineClipboardList className="text-lg" /> Tomar Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('see attendance')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'see attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineCalendar className="text-lg" /> Ver Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex-1 text-sm md:text-base cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'assignments' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineDocumentText className="text-lg" /> Asignaciones
                    </button>
                </div>
            </div>

            <div className="p-3 lg:p-4 xl:p-5 flex-1 styled-scrollbar overflow-y-auto">
                {activeTab === 'assignments' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.assignments.map((assignment) => (
                            <div key={assignment.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all bg-white flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <h3 className="font-bold text-custom-black leading-tight">{assignment.title}</h3>
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
                                        {assignment.type}
                                    </span>
                                </div>
                                <div className="mt-auto pt-3 border-t border-gray-50">
                                    <p className="text-xs text-gray-500 font-medium mb-3">
                                        Entrega: <span className="text-gray-700">{new Date(assignment.due_date).toLocaleDateString()}</span>
                                    </p>
                                    <button className="text-sm text-primary-600 font-bold hover:text-primary-800 w-full text-left transition-colors">
                                        Ver Calificaciones;
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.assignments.length === 0 && (
                            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-500 font-medium">No hay asignaciones creadas todavía.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-50">
                            {data.students.map((student) => (
                                <li key={student.student_id} className="py-3 px-5 flex items-center gap-4 hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-primary-shadow text-primary-darker flex items-center justify-center text-sm font-bold shrink-0">
                                        {getInitials(student.full_name)}
                                    </div>
                                    <div>
                                        <span className="block text-sm md:text-base capitalize font-medium text-custom-black">{reverseName(student.full_name)}</span>
                                        <span className="block text-sm text-gray-500">{student.email}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'register attendance' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Fecha de asistencia:</span>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            />
                        </div>

                        {loadingAttendance ? (
                            <LoadingContent title="Cargando..." />
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-50">
                                    {data.students.map((student) => {
                                        const status = attendanceRecords[student.student_id] || 'present';

                                        return (
                                            <StudentAttendanceRow
                                                key={student.student_id}
                                                student={student}
                                                status={status}
                                                onUpdate={updateStudentStatus}
                                            />
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'see attendance' && (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        {loadingGrid ? (
                            <div className="p-5">
                                <LoadingContent title="Cargando asistencia..." />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-max">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-wider">
                                            <th className="bg-gray-50 sticky left-0  p-4 border-b border-r border-gray-100 z-10 font-bold min-w-[200px]">
                                                Estudiantes
                                            </th>
                                            {calendarDates.map(date => {
                                                const { dayNum, month, weekday } = formatDate(date);

                                                return (
                                                    <th key={date} className="p-1 border-b border-gray-100 text-center font-semibold w-8">
                                                        <div className="text-[10px] flex flex-col items-center font-medium text-gray-400">
                                                            <span>{dayNum}</span>
                                                            <span className="text-custom-black -my-1">{month}</span>
                                                            <span>{weekday}</span>
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {attendanceGrid.map((student) => (
                                        <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="sticky left-0 bg-white p-4 border-r border-gray-100 z-10">
                                                <div className="truncate max-w-[200px] capitalize font-medium text-custom-black text-sm" title={reverseName(student.name)}>
                                                    {reverseName(student.name)}
                                                </div>
                                            </td>

                                            {student.records.map((record: any, idx: number) => {

                                                let bg = "bg-gray-100";
                                                if (record.status === 'present') bg = "bg-green-500 shadow-sm";
                                                if (record.status === 'absent') bg = "bg-red-500 shadow-sm";
                                                if (record.status === 'late') bg = "bg-yellow-300 shadow-sm";

                                                return (
                                                    <td key={idx} className="p-2 text-center border-r border-gray-50 last:border-0">
                                                        <div className={`w-3.5 h-3.5 mx-auto rounded-full ${bg}`} title={`${record.date.split('T')[0]}: ${record.status}`}></div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {attendanceGrid.length === 0 && (
                                        <tr>
                                            <td colSpan={calendarDates.length > 0 ? calendarDates.length + 1 : 2} className="p-10 text-center text-gray-500">
                                                {   //@ts-ignore
                                                    new Date() < new Date(selectedPeriod.start_date)
                                                    ? "Este periodo aún no ha comenzado."
                                                    : "No hay datos de asistencia para este periodo."}
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}