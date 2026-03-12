import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/client.ts";
import { LoadingContent } from "../../../components/Loadings.tsx";
import ButtonChevronBack from "../../../components/ButtonChevrowBack.tsx";
import {HiOutlineCalendar, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUsers} from "react-icons/hi";
import {getInitials, reverseName} from "../../../types";

interface Student {
    student_id: string;
    student_name: string;
}

interface ClassDetailsData {
    subject_name: string;
    course_name: string;
    total_students: number;
    students: Student[];
}

export default function TeacherCourseDetails() {
    const { id: classId } = useParams();
    const navigate = useNavigate();
    const [classDetails, setClassDetails] = useState<ClassDetailsData | null>(null);
    const [activeTab, setActiveTab] = useState<"students" | "register attendance" | "see attendance" | "assignments">("students");


    const [loading, setLoading] = useState(false);
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
                    <div className="bg-primary-shadow text-primary p-2 text-xs md:text-sm rounded-xl font-semibold flex items-center gap-2">
                        <HiOutlineUsers className="text-xl" />
                        {classDetails.total_students} Estudiantes
                    </div>
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
                    <div className="animate-fade-in">
                        <p className="text-gray-500">Módulo de toma de asistencia...</p>
                    </div>
                )}

                {activeTab === 'see attendance' && (
                    <div className="animate-fade-in overflow-x-auto">
                        <p className="text-gray-500">Grilla de asistencia histórica...</p>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="animate-fade-in">
                        {/* Assignments UI will go here */}
                        <p className="text-gray-500">Módulo de calificaciones próximamente...</p>
                    </div>
                )}

            </div>
        </div>
    );
}