import {HiDotsVertical} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

interface ClassData {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    director_id: string;
    director_name: string;
    student_count: string;
}

interface Props {
    id: string;
    data: ClassData[];
    isPrincipal: boolean;
    handleDelete?: (id: string) => void;
    handleEdit?: ([]) => void;
    options?: {
        loadingDelete: boolean;
    }
}

export default function CrossList ({
                                       id,
                                       data,
                                       isPrincipal,
                                       handleDelete,
                                       handleEdit,
                                       options }: Props) {
    const activeCourseId = id;
    const navigate = useNavigate();
    const ref = useRef<HTMLUListElement | null>(null);

    const [indexOption, setIndexOptions] = useState<number | null>(null);

    const handleShowOptions = (index: number) => {
        setIndexOptions(indexOption === index ? null : index);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIndexOptions(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [ref]);

    return (
        <div className="p-3 space-y-2">
            {data.map((course, index) => (
                <div
                    key={course.id}
                    className={`w-full group p-4 relative rounded-xl transition-colors flex items-center justify-between gap-3 border ${
                        activeCourseId === course.id
                            ? 'bg-primary-shadow border-primary-shadow'
                            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                    }`}
                >
                    <button
                        onClick={() => navigate(`${course.id}`)}
                        className="flex items-center cursor-pointer text-left gap-2">
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                            activeCourseId === course.id ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                        }`}>
                            {course.course_name ? course.course_name.replace("-", "") : "CC"}
                        </div>
                        <div className="max-w-36 overflow-hidden">
                            <h3 className={`font-bold text-base truncate ${activeCourseId === course.id ? 'text-primary-900' : 'text-custom-black'}`}>
                                Curso {course.course_name}
                            </h3>
                            <p className="text-gray-500 text-xs truncate">
                                {course.director_name || "Sin director"} • {course.student_count || 0} Est.
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => handleShowOptions(index)}
                        className="hover:bg-gray-100 cursor-pointer p-1.5 text-custom-black text-sm opacity-0 group-hover:opacity-100 transition-opacity md:text-base rounded-full ">
                        <HiDotsVertical />
                    </button>
                    {indexOption === index && (
                        <ul ref={ref} className="absolute z-40 w-48 h-fit p-2 text-sm md:text-base font-semibold right-0 lg:-right-[150px] top-3/4 bg-white text-custom-black shadow rounded-xl">
                            <li>
                                <button
                                    onClick={() => navigate(`/principal/notificaciones/asistencia?course=${course.course_name}`)}
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
                            {isPrincipal && (
                                <>
                                    <li>
                                        <button
                                            onClick={() => handleEdit}
                                            className="p-2 w-full text-left cursor-pointer hover:bg-gray-100 rounded-xl">
                                            Editar
                                        </button>
                                    </li>
                                    <hr className="border border-gray-100 rounded-xl my-2" />
                                    <li>
                                        <button
                                            onClick={() => handleDelete}
                                            disabled={options?.loadingDelete}
                                            className="p-2 w-full text-left cursor-pointer hover:bg-red-shadow text-red-error rounded-xl">
                                            {options?.loadingDelete ? "Cargando..." : "Eliminar"}
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    )
                    }
                </div>
            ))}
        </div>
    );
}