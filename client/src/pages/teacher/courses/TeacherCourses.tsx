import {Outlet, useNavigate, useParams} from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/client.ts";
import {LoadingPage} from "../../../components/Loadings.tsx";
import {HiDotsVertical} from "react-icons/hi";
import { GiBookAura } from "react-icons/gi";


interface TeacherCourse {
    id: string;
    name: string;
    total_students: string | number;
}

interface TeacherClass {
    class_id: string;
    subject_name: string;
    course_name: string;
    course_id: string;
    total_students: number;
}

function TeacherCourses() {
    const navigate = useNavigate();
    const { id: activeCourseId } = useParams();

    const [courseData, setCourseData] = useState<TeacherCourse | null>(null);
    const [classData, setClassData] = useState<TeacherClass[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Default to true

    useEffect(() => {
        const fetchCoursesAndClasses = async () => {
            try {
                setLoading(true);

                const [courseRes, classesRes] = await Promise.all([
                    api.get("/courses/teacher/course"),
                    api.get("/classes/teacher/classes")
                ]);

                console.log(courseRes, classesRes);
                setCourseData(courseRes.data.teacherCourse || null);
                setClassData(classesRes.data.teacherClasses || []);

            } catch (error: any) {
                console.error("Error fetching teacher data:", error);
                setError("Error al cargar el curso o las clases");
            } finally {
                setLoading(false);
            }
        }

        fetchCoursesAndClasses();
    }, []);

    if (loading) return <LoadingPage title="Cargando..."/>

    return (
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-3rem)] ">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4`}>
                <div className="flex flex-col p-3 space-y-2">
                    {courseData && (
                        <div
                            key={courseData.id}
                            className={`w-full group p-4 relative rounded-xl transition-colors flex items-center justify-between gap-3 border ${
                                activeCourseId === courseData.id
                                    ? 'bg-primary-shadow border-primary-shadow'
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                            }`}
                        >
                            <button
                                onClick={() => navigate(`${courseData.id}`)}
                                className="flex items-center cursor-pointer text-left gap-2"
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                                    activeCourseId === courseData.id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                                }`}>
                                    {courseData.name ? courseData.name.replace("-", "") : "CC"}
                                </div>
                                <div>
                                    <h3 className={`font-bold capitalize text-base truncate ${activeCourseId ===  courseData.id ? 'text-primary-900' : 'text-custom-black'}`}>
                                        Curso {courseData.name}
                                    </h3>
                                </div>
                            </button>
                            <button
                                onClick={() => {}}
                                className="hover:bg-gray-100 cursor-pointer p-1.5 text-custom-black text-sm opacity-0 group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                <HiDotsVertical />
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 m-4 text-sm">{error}</p>}

                    <hr className="w-full rounded-full border border-gray-100"/>

                    <div>
                        {classData.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center shadow-sm">
                                <p className="text-gray-500">No tienes clases asignadas en este momento.</p>
                            </div>
                        ) : (
                            <div>
                                {classData.map((cls) => (
                                    <div
                                        key={cls.class_id}
                                        className={`w-full group p-4 relative rounded-xl transition-colors flex items-center justify-between gap-3 border ${
                                            activeCourseId === cls.class_id
                                                ? 'bg-primary-shadow border-primary-shadow'
                                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                        }`}
                                    >
                                        <button
                                            onClick={() => navigate(`${cls.class_id}`)}
                                            className="flex items-center cursor-pointer text-left gap-2"
                                        >
                                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                                                activeCourseId === cls.class_id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                                            }`}>
                                                {cls.course_name ? cls.course_name.replace("-", "") : "CC"}
                                            </div>
                                            <div className="flex flex-col gap-0.5 items-start">
                                                <h3 className={`font-bold capitalize text-base truncate ${activeCourseId === cls.class_id ? 'text-primary-900' : 'text-custom-black'}`}>
                                                    {cls.subject_name} • {cls.course_name}
                                                </h3>
                                                <p className="text-gray-400 text-xs">{cls.total_students} Estudiantes</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {}}
                                            className="hover:bg-gray-100 cursor-pointer p-1.5 text-custom-black text-sm opacity-0 group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                            <HiDotsVertical />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto ${!activeCourseId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {activeCourseId ? (
                    <Outlet />
                ) : (
                    <div className="flex items-center justify-center flex-col text-gray-400 p-10">
                        <GiBookAura className="text-4xl" />
                        <h3 className="text-xl font-medium text-gray-500">Selecciona una clase</h3>
                        <p className="text-sm mt-2">Haz clic en una clase de la lista para ver sus detalles y estudiante.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherCourses;