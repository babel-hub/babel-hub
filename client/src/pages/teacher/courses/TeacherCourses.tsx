import {Outlet, useNavigate, useParams} from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import api from "../../../api/client.ts";
import {LoadingPage} from "../../../components/Loadings.tsx";
import {HiDotsVertical} from "react-icons/hi";
import {IoSchool} from "react-icons/io5";

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
    const { id: activeCourseId } = useParams();
    const navigate = useNavigate();
    const ref = useRef<HTMLUListElement | null>(null);

    const [courseData, setCourseData] = useState<TeacherCourse | null>(null);
    const [indexOption, setindexOption] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
    const [classData, setClassData] = useState<TeacherClass[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoursesAndClasses = async () => {
            try {
                const [courseRes, classesRes] = await Promise.all([
                    api.get("/courses/teacher/course"),
                    api.get("/classes/teacher/classes")
                ]);

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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setindexOption(null);
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref]);

    const handleShowOptions = (index: number, e: React.MouseEvent) => {
        if (indexOption === index) {
            setindexOption(null);
            return;
        }

        const clickY = e.clientY;
        const windowHeight = window.innerHeight;

        if (windowHeight - clickY < 250) {
            setMenuPosition('top');
        } else {
            setMenuPosition('bottom');
        }

        setindexOption(index);
    };

    if (loading) return <LoadingPage title="Cargando..."/>

    return (
        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100dvh-6rem)] md:h-[calc(100dvh-2.5rem)] ">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex h-full flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4`}>
                <div className="flex flex-col h-full p-3 space-y-2">
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
                                disabled={true}
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
                                disabled={true}
                                className="p-1.5 text-transparent text-sm xl:opacity-0 xl:group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                <HiDotsVertical />
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 m-4 text-sm">{error}</p>}

                    <hr className="w-full rounded-full border border-gray-100"/>

                    <div className="space-y-2 flex-1 overflow-y-auto styled-scrollbar overflow-x-hidden">
                        {classData.length === 0 ? (
                            <div className="p-5 lg:p-10 text-center">
                                <p className="text-gray-500">No tienes clases asignadas en este momento.</p>
                            </div>
                        ) : (
                            <div>
                                {classData.map((cls, index) => (
                                    <div
                                        key={cls.class_id}
                                        className={`w-full group px-2 xl:px-3 py-4 2xl:p-4 relative rounded-xl transition-colors flex items-center justify-between gap-2 2xl:gap-3 border ${
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
                                                {cls.course_name ? cls.course_name.replace("-", "") : "UN"}
                                            </div>
                                            <div className="max-w-full lg:max-w-28 2xl:max-w-36 overflow-hidden">
                                                <h3 className={`font-bold capitalize text-base truncate ${activeCourseId === cls.class_id ? 'text-primary-900' : 'text-custom-black'}`}>
                                                    {cls.subject_name} • {cls.course_name}
                                                </h3>
                                                <p className="text-gray-400 text-xs">{cls.total_students} Estudiantes</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowOptions(index, e);
                                            }}
                                            className="cursor-pointer p-1.5 text-custom-black text-sm xl:opacity-0 xl:group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                                            <HiDotsVertical />
                                        </button>
                                        {indexOption === index && (
                                            <ul
                                                ref={ref}
                                                className={`absolute z-50 w-48 h-fit p-2 text-sm md:text-base font-semibold right-4 bg-white text-custom-black shadow-lg border border-gray-100 rounded-xl ${
                                                    menuPosition === 'top' ? 'bottom-12' : 'top-12'
                                                }`}
                                            >
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/teacher/clases/${cls.class_id}?button=see attendance`)}
                                                        className="p-2 w-full text-left cursor-pointer hover:bg-gray-100 rounded-xl"
                                                    >
                                                        Ver asistencia
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="p-2 cursor-not-allowed w-full text-left hover:bg-gray-100 rounded-xl">
                                                        Ver notas
                                                    </button>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto ${!activeCourseId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {activeCourseId ? (
                    <Outlet key={activeCourseId} />
                ) : (
                    <div className="flex items-center justify-center flex-col text-gray-400 p-10">
                        <IoSchool className="text-4xl text-primary" />
                        <h3 className="text-xl font-medium text-custom-black">Selecciona una clase</h3>
                        <p className="text-sm mt-2 text-center">Haz clic en una clase de la lista para ver sus detalles y estudiante.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherCourses;