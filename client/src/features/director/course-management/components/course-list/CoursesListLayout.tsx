import { PrimaryButton } from "../../../../../components/ui/buttons/Buttons.tsx";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import { CoursesList } from "./CoursesList.tsx";
import { useCourseData } from "../../hooks/course-list/useCourseData.ts";
import { useDeleteCourse } from "../../hooks/course-list/useDeleteCourse.ts";
import { LoadingPage } from "../../../../../components/ui/Loadings.tsx";
import { ConfirmModal } from "../../../../../components/ui/modals/ConfirmModal.tsx";
import { CourseListFormModal } from "../ui/CourseListFormModal.tsx";
import type { ModalModeTypes } from "../../../../../types";
import { NoOutletInfo } from "../../../../../components/ui/blocks/NoOutletInfo.tsx";
import type { CoursesListData } from "../../types";

export function CoursesListLayout() {
    const navigate = useNavigate();
    const { id: activeCourseId } = useParams<{ id: string }>();

    const [modalMode, setModalMode] = useState<ModalModeTypes>('none');
    const [courseToEdit, setCourseToEdit] = useState<CoursesListData | null>(null);
    const [teacherToEdit, setTeacherToEdit ] = useState<string | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<CoursesListData | null>(null);

    const { loading, courses, fetchCourses } = useCourseData();
    const { loadingDelete, deleteCourseById } = useDeleteCourse(fetchCourses);

    const handleEdit = useCallback((course: CoursesListData) => {
        setCourseToEdit(course);
        setTeacherToEdit(course.director_id);
        setModalMode('edit');
    }, []);

    const handleDelete = useCallback((course: CoursesListData) => {
        setCourseToDelete(course);
    }, []);

    const handleNavigate = useCallback((id: string) => {
        navigate(`${id}`);
    }, [navigate]);

    if (loading) return <LoadingPage title="Cargando cursos..." />

    return (
        <div className="flex flex-col lg:flex-row gap-3 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-1.8rem)]">
            <div className={`bg-white md:rounded-xl shadow-sm border border-gray-100 h-full flex flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/5`}>
                <div className="p-3 border-b border-gray-100 grid grid-cols-3 justify-between gap-5 items-start md:items-center md:rounded-t-xl bg-white z-10">
                    <h2 className="text-xl font-bold col-span-2 text-custom-black w-full">Cursos</h2>
                    <PrimaryButton
                        full={false}
                        onClick={() => {
                            setCourseToEdit(null);
                            setModalMode('create');
                        }}
                        title="+"
                    />
                </div>

                <CoursesList
                    courses={courses}
                    activeCourseId={activeCourseId}
                    onEditCourse={handleEdit}
                    onDeleteCourse={handleDelete}
                    onNavigate={handleNavigate}
                    loadingDelete={loadingDelete}
                />
            </div>

            <div className={`bg-white md:rounded-xl shadow-sm border border-gray-100 flex-1 no-scrollbar overflow-y-auto ${!activeCourseId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {activeCourseId ? (
                    <Outlet key={activeCourseId} />
                ) : (
                    <NoOutletInfo title="Selecciona un curso" paragraph="Haz clic en un curso de la lista para ver sus detalles, estudiantes y clases asignadas." />
                )}
            </div>

            <ConfirmModal
                isOpen={courseToDelete !== null}
                onClose={() => setCourseToDelete(null)}
                onConfirm={async () => {
                    if (courseToDelete) {
                        await deleteCourseById(courseToDelete.id);
                        setCourseToDelete(null);
                        navigate("/principal/cursos/")
                    }
                }}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar el curso ${courseToDelete?.course_name}? Esta acción no se puede deshacer.`}
                loadingDelete={loadingDelete}
            />

            {modalMode !== "none" && (
                <CourseListFormModal
                    mode={modalMode}
                    teacherId={teacherToEdit}
                    course={courseToEdit}
                    onClose={() => {
                        setTeacherToEdit(null);
                        setModalMode('none');
                    }}
                    onSuccess={async () => {
                        setTeacherToEdit(null);
                        setModalMode('none');
                        await fetchCourses();
                    }}
                />
            )}
        </div>
    )
}