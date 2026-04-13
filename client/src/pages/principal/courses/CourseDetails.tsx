import React, {useEffect, useState, useRef, useCallback, memo} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../api/client.ts";
import { LoadingContent } from "../../../components/Loadings.tsx";
import { PrimaryButton } from "../../../components/Buttons.tsx";
import DynamicModalForm, {type FormField} from "../../../components/ModalForm.tsx";
import { formatterDate, getInitials, getStatusDotColor, reverseName } from "../../../types";
import toast from "react-hot-toast";
import { HiDotsVertical } from "react-icons/hi";
import { ConfirmModal } from "../../../components/ConfirmModal.tsx";
import axios from "axios";

interface Student {
    student_id: string;
    full_name: string;
    email: string;
}

interface ClassItem {
    class_id: string;
    class_name: string;
    subject_name: string;
    teacher_name: string;
}

interface CourseData {
    course: {
        id: string;
        name: string;
        created_at: string;
        year: string | number;
    };
    students: Student[];
    classes: ClassItem[];
}

interface ClassRowProps {
    cls: ClassItem;
    index: number;
    totalRecords: number;
    isOpen: boolean;
    onNavigate: (id: string) => void;
    onToggleMenu: (id: string) => void;
    onEdit: ([]: ClassItem) => void;
    onDelete: ([]: ClassItem) => void;
}

const ClassRowItem = memo(function ClassRowItem({
                                                    cls,
                                                    index,
                                                    totalRecords,
                                                    isOpen,
                                                    onNavigate,
                                                    onToggleMenu,
                                                    onEdit,
                                                    onDelete
                                                }: ClassRowProps) {
    const isLast = index === totalRecords - 1;

    return (
        <li className="flex w-full group relative p-3 items-center justify-between">
            <button
                onClick={() => onNavigate(cls.class_id)}
                className="cursor-pointer flex justify-between items-center transition-colors w-full"
            >
                <div className="text-left">
                    <p className="font-medium text-custom-black">{cls.subject_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Prof: {cls.teacher_name}</p>
                </div>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleMenu(cls.class_id);
                }}
                className="hover:text-gray-500 cursor-pointer p-1.5 text-gray-300 text-base opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:text-lg rounded-full"
            >
                <HiDotsVertical/>
            </button>
            {isOpen && (
                <ul className={`absolute ${isLast ? "bottom-5" : "top-5"} right-10 z-50 w-32 h-fit p-2 text-sm md:text-base font-semibold bg-white text-custom-black shadow-lg border border-gray-100 rounded-xl`}>
                    <li>
                        <button onClick={() => onEdit(cls)} className="p-2 w-full text-left cursor-pointer hover:bg-gray-100 rounded-xl">
                            Editar
                        </button>
                    </li>
                    <hr className="border border-gray-100 rounded-xl my-1"/>
                    <li>
                        <button onClick={() => onDelete(cls)} className="p-2 w-full text-left cursor-pointer hover:bg-red-shadow text-red-error rounded-xl">
                            Eliminar
                        </button>
                    </li>
                </ul>
            )}
        </li>
    );
});

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
    const [error, setError] = useState('');

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'none'>('none');
    const [showClasses, setShowClasses] = useState<boolean>(false);
    const [loadingDeleteClass, setLoadingDeleteClass] = useState<boolean>(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [classToEdit, setClassToEdit] = useState<string | null>(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
    const [classOptions, setClassOptions] = useState<string | null>(null);

    const date = formatterDate.format(new Date());

    const [formData, setFormData] = useState({
        courseId: id || "",
        subjectId: "",
        teacherId: ""
    });

    const fetchCourseDetails = useCallback(async (courseId: string, signal?: AbortSignal) => {
        setLoading(true);

        try {
            setError("");
            const response = await api.get(`/courses/${courseId}`, { signal });
            setData(response.data);
            await fetchAttendanceSummary(response.data, date, signal);
            setLoading(false);
        } catch (error: any) {
            if (axios.isCancel(error) || (error as Error).name === 'AbortError') return;
            console.error(error);
            setError(error.response?.data?.message || error.message || "Error al cargar la informacion del curso.");
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        if (!id) return;
        const controller = new AbortController();
        fetchCourseDetails(id, controller.signal);
        setFormData(prev => ({ ...prev, courseId: id }));

        return () => controller.abort();
    }, [id, fetchCourseDetails]);

    //@ts-ignore
    const assignClassFields: FormField[] = [
        {
            name: "courseId",
            label: "Curso",
            type: "text",
            disabled: true,
        },
        {
            name: "subjectId",
            label: "Materia",
            type: "select",
            required: true,
            options: subjects.map(s => ({ value: s.id, label: s.name }))
        },
        {
            name: "teacherId",
            label: "Profesor",
            type: "select",
            required: true,
            options: teachers.map(t => ({ value: t.id, label: t.full_name }))
        }
    ].filter(field => modalMode === "create" || (field.name !== 'courseId' && field.name !== 'subjectId'));

    const fetchAttendanceSummary = async (courseData: CourseData, currentDate: string, signal?: AbortSignal) => {
        if (!courseData?.students || courseData.students.length === 0) return;
        setLoadingAttendance(true);

        try {
            const response = await api.get(
                `/attendance/course/${courseData.course.id}/summary?date=${currentDate}`,
                { signal }
            );

            const fetchedRecords = response.data.records;
            const newRecordsMap: Record<string, string> = {};

            courseData.students.forEach(student => {
                const existingRecord = fetchedRecords.find((r: any) => r.student_id === student.student_id);
                newRecordsMap[student.student_id] = existingRecord?.daily_status ?? 'present';
            });

            setAttendanceRecords(newRecordsMap);
            setLoadingAttendance(false);
        } catch (error: any) {
            if (axios.isCancel(error) || (error as Error).name === 'AbortError') return;
            console.error("Error fetching attendance:", error);
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowClasses(false);
                setClassOptions(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const teachersResponse = await api.get(`/teacher`);
            setTeachers(teachersResponse.data.teachers || teachersResponse.data);
        } catch (error: any) {
            setFormError("Error cargando los profesores");
        }
    }, []);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const subjectsResponse = await api.get(`/courses/course/${id}`);
                setSubjects(subjectsResponse.data.availableSubjects || subjectsResponse.data);
                await fetchTeachers();
            } catch (err) {
                setFormError("Error cargando los datos del formulario.");
            }
        }

        if (modalMode === "create") {
            fetchDropdownData();
        }
    }, [modalMode, id, fetchTeachers]);

    const handleDeleteClass = async (classId: string) => {
        setLoadingDeleteClass(true);

        try {
            await api.delete(`/classes/${classId}`);
            await fetchCourseDetails(id as string);
            setClassToDelete(null);
            toast.success("Clase eliminada correctamente");
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Error al eliminar la clase.";
            console.error(msg);
            toast.error(msg);
        } finally {
            setLoadingDeleteClass(false);
        }
    }

    const handleAssignClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            if (modalMode === "create") {
                await api.post("/classes", formData);
            } else if (modalMode === "edit") {
                await api.put(`/classes/${classToEdit}`, { newTeacher: formData.teacherId });
            }

            setModalMode("none");
            setFormData({ courseId: id || "", subjectId: "", teacherId: "" });
            await fetchCourseDetails(id as string);

            toast.success(`Clase ${modalMode === "create" ? "creada" : "editada"} correctamente.`);
        } catch (err: any) {
            setFormError(err.response?.data?.message || "Error al asignar la clase.");
        } finally {
            setFormLoading(false);
        }
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNavigateToClass = useCallback((classId: string) => {
        navigate(`clase/${classId}`);
    }, [navigate]);

    const handleShowClassOptions = useCallback((classId: string) => {
        setClassOptions(prev => prev === classId ? null : classId);
    }, []);

    const handleDeleteClick = useCallback((cls: ClassItem) => {
        setClassToDelete(cls);
        setClassOptions(null);
    }, []);

    const handleUpdateClass = useCallback(async (classInfo: ClassItem) => {
        setClassOptions(null);
        setClassToEdit(classInfo.class_id);

        setFormData({
            courseId: id || "",
            teacherId: "",
            subjectId: "",
        });

        setModalMode("edit");
        await fetchTeachers();
    }, [id, fetchTeachers]);

    if (loading || loadingAttendance) return <LoadingContent title="Cargando curso..."/>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!data) return <div className="p-6 text-gray-500 text-center">No se encontró el curso.</div>;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="sticky relative top-0 z-10 bg-white border-b border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-custom-black">
                        Curso: {data.course.name}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Año Lectivo: {data.course.year}</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-5 items-center">
                    <PrimaryButton onClick={() => setModalMode("create")} title="Asignar asignatura"/>
                    <div className="w-full md:w-auto" ref={dropdownRef}>
                        <PrimaryButton
                            onClick={() => setShowClasses(!showClasses)}
                            title={showClasses ? "Ocultar Clases" : "Ver Clases"}
                        />
                        {showClasses && (
                            <div className="absolute right-5 top-full w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b border-gray-100">
                                    <h3 className="font-bold text-sm text-gray-700">Clases Asignadas</h3>
                                </div>

                                <ul className="divide-y w-full divide-gray-100 max-h-[300px] overflow-y-auto">
                                    {data.classes.map((cls, index, records) => (
                                        <ClassRowItem
                                            key={cls.class_id}
                                            cls={cls}
                                            index={index}
                                            totalRecords={records.length}
                                            isOpen={classOptions === cls.class_id}
                                            onNavigate={handleNavigateToClass}
                                            onToggleMenu={handleShowClassOptions}
                                            onEdit={handleUpdateClass}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                    {data.classes.length === 0 && (
                                        <p className="text-gray-500 text-center py-6 text-sm">No hay clases asignadas a este curso.</p>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 overflow-y-auto styled-scrollbar">
                <div className="flex w-full mb-2 items-end justify-between">
                    <h2 className="text-lg font-bold text-primary">
                        Estudiantes
                    </h2>
                    <h2 className="text-xs pr-4 text-primary">
                        Asistencia
                    </h2>
                </div>
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="overflow-y-auto h-full">
                        <ul>
                            {data.students.map((student) => {
                                const status = attendanceRecords[student.student_id] || 'present';

                                return (
                                    <li className="mb-3" key={student.student_id}>
                                        <div className="p-2 shadow-sm rounded-xl border border-gray-100 flex w-full justify-between items-center hover:bg-gray-50 transition-colors">
                                            <button
                                                onClick={() => navigate(`/principal/comunidad/estudiantes/${student.student_id}`)}
                                                className="flex items-center cursor-pointer justify-start gap-3"
                                            >
                                                <div className="w-10 h-10 shrink-0 rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-sm">
                                                    {getInitials(student.full_name)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-custom-black">{reverseName(student.full_name)}</p>
                                                </div>
                                            </button>
                                            <span
                                                className={`w-4 h-4 mr-5 rounded-full ${getStatusDotColor(status)}`}
                                                title={`Estado: ${status}`}
                                            ></span>
                                        </div>
                                    </li>
                                );
                            })}
                            {data.students.length === 0 && (
                                <p className="text-gray-500 text-center py-6 text-sm">No hay estudiantes en este curso.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={classToDelete !== null}
                onClose={() => setClassToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar la clase de ${classToDelete?.subject_name}?`}
                onConfirm={async () => {
                    if (classToDelete) {
                        await handleDeleteClass(classToDelete.class_id);
                    }
                }}
                loadingDelete={loadingDeleteClass}
            />

            <DynamicModalForm
                isOpen={modalMode !== 'none'}
                title={modalMode === 'create' ? "Crear Nueva Clase" : "Editar Profesor de Clase"}
                fields={assignClassFields}
                formData={{...formData, courseId: data?.course.name || formData.courseId }}
                formError={formError}
                formLoading={formLoading}
                onChange={handleFormChange}
                onSubmit={handleAssignClass}
                onClose={() => {
                    setModalMode("none");
                    setFormError("");
                    setFormData({ courseId: id || "", teacherId: "", subjectId: "" });
                }}
            />
        </div>
    );
}