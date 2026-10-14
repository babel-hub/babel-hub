import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { useParams } from "react-router-dom";
import { LoadingContent } from "../../../../../components/ui/Loadings.tsx";
import { useCourseData } from "../../hooks/course-details/useCourseData.ts";
import { formatterDate, type ModalModeTypes } from "../../../../../types";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ClassItem } from "../../types";
import { ClassList } from "./ClassList.tsx";
import { CourseDetailsStudentsTable } from "../ui/CourseDetailsStudentsTable.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { useDeleteClass } from "../../hooks/course-details/useDeleteClass.ts";
import { CourseDetailsFormModal } from "../ui/CourseDetailsFormModal.tsx";
import toast from "react-hot-toast";
import { PrimaryLink } from "../../../../../components/ui/link/PrimaryLink.tsx";

export function CourseDetailsLayout() {
    const { courseId } = useParams<{ courseId: string }>();

    const date = formatterDate.format(new Date());
    const { loading, course, attendance, refetch } = useCourseData(courseId, date);
    const { loadingDelete, deleteClassById } = useDeleteClass(refetch);

    const classesDropDown = useRef<HTMLDivElement>(null)
    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [showClasses, setShowClasses] = useState<boolean>(false);
    const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
    const [classToEdit, setClassToEdit] = useState<ClassItem | null>(null);

    useEffect(() => {
        const handleClassesDropDown = (e: MouseEvent) => {
            const target = e.target as Element;

            if (target.closest('.action-menu-portal')) {
                return;
            }

            if (classesDropDown.current && !classesDropDown.current.contains(target)) {
                setShowClasses(false);
            }
        };

        document.addEventListener('mousedown', handleClassesDropDown);
        return () => document.removeEventListener('mousedown', handleClassesDropDown);
    }, []);

    const handleUpdate = useCallback((cls: ClassItem) => {
        setClassToEdit(cls);
        setModalMode("edit");
        setShowClasses(false);
    }, []);

    const handleDelete = useCallback((cls: ClassItem) => {
        setClassToDelete(cls);
        setShowClasses(false);
    }, []);

    if (!courseId) {
        toast.error("No se encontró el ID del curso en la URL");
        return null;
    };

    if (loading) return <LoadingContent title="Cargando curso..."/>;
    if (!course) return <div className="p-6 text-gray-500 text-center">No se encontró el curso.</div>;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-1xl xl:text-2xl font-bold text-custom-black">
                        Curso
                        <span className="text-primary-darker text-base md:text-lg xl:text-xl"> {course.course.course_name}</span>
                    </h1>
                </div>
                <div className="flex w-full md:w-auto gap-2 items-center">
                    <PrimaryLink
                        goTo="acumulados" children="Acumulados"
                    />
                    <PrimaryLink
                        goTo="horario" children="Horario"
                    />
                    <div className="w-full md:w-auto" ref={classesDropDown}>
                        <PrimaryButton
                            onClick={() => setShowClasses(!showClasses)}
                            title="Clases"
                        />
                        {showClasses && (
                            <ClassList
                                createClass={() => setModalMode("create")}
                                classes={course.classes}
                                onEdit={handleUpdate}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            <CourseDetailsStudentsTable
                students={course.students}
                attendance={attendance}
            />

            <ConfirmModal
                isOpen={classToDelete !== null}
                onClose={() => setClassToDelete(null)}
                title="Eliminar clase"
                message={`Se eliminara la clase "${classToDelete?.subject_name}". Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (classToDelete) {
                        await deleteClassById(classToDelete.class_id);
                        setClassToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {modalMode !== 'none' && (
                <CourseDetailsFormModal
                    id={courseId}
                    courseName={course.course.course_name}
                    mode={modalMode}
                    classToEdit={classToEdit}
                    onSuccess={() => {
                        setClassToEdit(null);
                        setModalMode('none');
                        refetch();
                    }}
                    onClose={() => {
                        setClassToEdit(null);
                        setModalMode('none');
                    }}
                />
            )}
        </div>
    )
}