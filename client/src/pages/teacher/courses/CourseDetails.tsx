import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/client.ts";
import { LoadingContent } from "../../../components/Loadings.tsx";
import ButtonChevronBack from "../../../components/ButtonChevrowBack.tsx";
import {HiOutlineCalendar, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUsers} from "react-icons/hi";
import {formatDate, formatterDate, getInitials, reverseName} from "../../../types";
import {PrimaryButton} from "../../../components/Buttons.tsx";

interface Student {
    student_id: string;
    student_name: string;
}

interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface ClassDetailsData {
    subject_name: string;
    course_id: string;
    course_name: string;
    total_students: number;
    students: Student[];
}

export default function TeacherCourseDetails() {
    const { id: classId } = useParams();
    const navigate = useNavigate();
    const [classDetails, setClassDetails] = useState<ClassDetailsData | null>(null);
    const [classAttendance, setClassAttendance] = useState<Record<string, string>>({})

    const date = formatterDate.format(new Date());
    const [attendanceDate, setAttendanceDate] = useState(date);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
    const [calendarDates, setCalendarDates] = useState<string[]>([]);
    const [attendanceGrid, setAttendanceGrid] = useState<any[]>([]);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [activeTab, setActiveTab] = useState<"students" | "register attendance" | "see attendance" | "assignments">("students");


    const [loading, setLoading] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [loadingAttendancePeriod, setLoadingAttendancePeriod] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchClass= async () => {
            try {
                setLoading(true);

                const classInfo = await api.get(`/classes/teacher/class/${classId}`)
                setClassDetails(classInfo.data.teacherClass || classInfo.data);
            } catch (error) {
                setError("Error fetching los detalles de la clase");
            } finally {
                setLoading(false);
            }
        }

        if (classId) fetchClass();
    }, [classId]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!classDetails?.students || activeTab !== "register attendance") return;

            try {
                setLoadingAttendance(true);

                const attendance = await api.get(`/attendance/class/${classId}?date=${attendanceDate}`);

                const fetchedRecords = attendance.data.records;
                const newRecordsMap: Record<string, string> = {};

                classDetails.students.forEach(student => {
                    const record = fetchedRecords.find((record: any) => record.student_id === student.student_id);
                    newRecordsMap[student.student_id] = record?.status ?? 'present';
                })

                setClassAttendance(newRecordsMap);
            } catch (error : any) {
                console.error(error);
            } finally {
                setLoadingAttendance(false);
            }
        }

        fetchAttendance()
    }, [activeTab, attendanceDate, classId, classDetails]);


    useEffect(() => {
        const fetchPeriodAttendance = async () =>  {
            if (!selectedPeriod || activeTab !== 'see attendance') return;

            const today = new Date();
            const courseId = classDetails?.course_id;
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
                setLoadingAttendancePeriod(true);

                const attendanceRecords = await api.get(`/attendance/course/${courseId}/class/${classId}?startDate=${selectedPeriod.start_date}&endDate=${effectiveEndDate}`);
                const attendanceData = attendanceRecords.data.attendanceClass;

                const datesSet = new Set<string>();
                const studentMap = new Map();

                attendanceData.forEach((row: any) => {
                    datesSet.add(row.date);

                    if (!studentMap.has(row.student_id)) {
                        studentMap.set(row.student_id, {
                            student_id: row.student_id,
                            name: row.name,
                            records: []
                        });
                    }

                    studentMap.get(row.student_id).records.push({date: row.date, status: row.status});
                })

                setCalendarDates(Array.from(datesSet).sort());
                setAttendanceGrid(Array.from(studentMap.values()));
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingAttendancePeriod(false);
            }
        }

        fetchPeriodAttendance();
    }, [activeTab, selectedPeriod, activeTab, classId]);

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


    const handleSaveAttendance = async () => {
        try {
            setSavingAttendance(true);

            const recordsArr =  Object.entries(classAttendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await api.post(`/attendance/class/${classId}/bulk`, {
                date: attendanceDate,
                records: recordsArr
            });

            alert("Asistencia guardada correctamente.");
        } catch (error: any) {
            console.error(error);
            alert("Error saving attendance");
        } finally {
            setSavingAttendance(false);
        }

    }

    const updateStudentStatus = (id:string, status:'present' | 'absent' | 'late') => {
           setClassAttendance(prev => ({...prev, [id]: status }));
    }

    if (loading) return <LoadingContent title="Cargando clase..."/>;

    if (error || !classDetails) return <div className="text-red-error text-center m-5 p-4 bg-red-shadow rounded-xl">{error || "Clase no encontrada"}</div>;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col justify-between items-start">
                <div className="flex w-full p-5 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonChevronBack onClick={() => navigate(-1)}/>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-custom-black">{classDetails.subject_name}</h1>
                            <p className="text-gray-500  text-xs md:text-sm font-medium">Curso: {classDetails.course_name}</p>
                        </div>
                    </div>
                    {activeTab === "students" && (
                        <div className="bg-primary-shadow text-primary p-2 text-xs md:text-sm rounded-xl font-semibold flex items-center gap-2">
                            <HiOutlineUsers className="text-xl" />
                            {classDetails.total_students} Estudiantes
                        </div>)
                    }

                    {activeTab === "register attendance" && (
                        <PrimaryButton
                            onClick={handleSaveAttendance}
                            disabled={savingAttendance}
                            title={savingAttendance ? "Guardando..." : "Guardar Asistencia"}
                        />
                    )}

                    {activeTab === "see attendance" && (
                        <select
                            className="bg-gray-50 text-sm md:text-base appearance-none border border-gray-200 text-custom-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer"
                            value={selectedPeriod?.id || ""}
                            onChange={(e) => {
                                const period = periods.find(p => p.id === e.target.value);
                                setSelectedPeriod(period || null)
                            }}
                        >
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                            {periods.length === 0 && <option value="">Sin periodos</option>}
                        </select>
                    )}
                </div>
                <div className="flex overflow-x-auto bg-white w-full rounded-xl p-1 custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'students' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineUsers className="text-lg" /> Estudiantes
                    </button>
                    <button
                        onClick={() => setActiveTab('register attendance')}
                        className={`flex-1 cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'register attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineClipboardList className="text-lg" /> Tomar Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('see attendance')}
                        className={`flex-1 cursor-pointer min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'see attendance' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineCalendar className="text-lg" /> Ver Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 font-medium border-b-2 border-transparent transition-all ${activeTab === 'assignments' ? 'text-primary border-b-primary border-b-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <HiOutlineDocumentText className="text-lg" /> Calificaciones
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto p-5 max-h-[500px] no-scrollbar h-full">
                {activeTab === 'students' && (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-bold text-custom-black mb-4">Estudiantes</h2>
                        {classDetails?.students?.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">No hay estudiantes inscritos en este curso.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {classDetails.students.map((student) => (
                                    <div key={student?.student_id} className="flex items-center gap-3 p-2 border hover:bg-gray-50 transition-colors border-gray-100 rounded-xl">
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-sm">
                                            {getInitials(student.student_name)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-custom-black">{reverseName(student.student_name)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            <LoadingContent  title="Cargando..." />
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-50">
                                    {classDetails?.students?.map((student) => {
                                        const status = classAttendance[student.student_id] || "present";

                                        return (
                                            <li key={student.student_id} className="p-4 flex flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold shrink-0">
                                                        {getInitials(student.student_name)}
                                                    </div>
                                                    <span className="font-medium text-custom-black">{reverseName(student.student_name)}</span>
                                                </div>
                                                <div className="flex p-1 shrink-0">
                                                    <button
                                                        onClick={() => updateStudentStatus(student.student_id, 'present')}
                                                        className={`px-2 py-1.5 rounded-md transition-all`}
                                                    >
                                                        <span className={`border-2 w-4 h-4 rounded-full block ${status === 'present' ? 'bg-green-600 border-green-600' : 'bg-transparent border-gray-600'}`}></span>
                                                    </button>
                                                    <button
                                                        onClick={() => updateStudentStatus(student.student_id, 'late')}
                                                        className={`px-2 py-1.5 rounded-md transition-all}`}
                                                    >
                                                        <span className={`border-2 w-4 h-4 rounded-full block ${status === 'late' ? 'bg-yellow-400 border-yellow-400' : 'bg-transparent border-gray-600'}`}></span>
                                                    </button>
                                                    <button
                                                        onClick={() => updateStudentStatus(student.student_id, 'absent')}
                                                        className={`px-2 py-1.5 rounded-md transition-all'}`}
                                                    >
                                                        <span className={`border-2 w-4 h-4 rounded-full block ${status === 'absent' ? 'bg-red-600 border-red-600' : 'bg-transparent border-gray-600'}`}></span>
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'see attendance' && (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        {loadingAttendancePeriod ? (
                            <div className="p-5">
                                <LoadingContent title="Cargando asistencia..." />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-max">
                                    <thead>
                                        <tr>
                                            <th className="sticky left-0 bg-gray-50 p-4 border-b border-r border-gray-100 z-10 font-bold min-w-[200px]">
                                                Estudiante
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
                                                )
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attendanceGrid.map((student) => (
                                            <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="sticky left-0 bg-white p-4 border-r border-gray-100 z-10 font-medium text-custom-black text-sm truncate max-w-[200px]" title={reverseName(student.name)}>
                                                    {reverseName(student.name)}
                                                </td>
                                                {student.records.map((record: any, index: number) => {
                                                    let bg = "bg-gray-100";
                                                    if (record.status === "present") bg = "bg-green-500 border-green-500";
                                                    if (record.status === "absent") bg = "bg-red-500 border-red-500";
                                                    if (record.status === "late") bg = "bg-yellow-300 border-yellow-300";

                                                    return (
                                                        <td key={index} className="p-2 text-center border-r border-gray-50 last:border-0">
                                                            <div className={`w-3.5 h-3.5 mx-auto rounded-full ${bg}`} title={`${record.date.split('T')[0]}: ${record.status}`}></div>
                                                        </td>
                                                    )
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

                {activeTab === 'assignments' && (
                    <div className="text-center p-5 animate-fade-in">
                        <p className="text-gray-500">Módulo de calificaciones</p>
                    </div>
                )}

            </div>
        </div>
    );
}