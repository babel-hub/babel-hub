import { useTeacherClasses } from "../hooks/useTeacherClasses.ts";
import { LoadingPage } from "../../../../../components/ui/Loadings.tsx";
import { InteractiveHomeList } from "../../../../../components/ui/lists/InteractiveHomeList.tsx";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { NoOutletInfo } from "../../../../../components/ui/blocks/NoOutletInfo.tsx";
import { HiOutlineClipboardList } from "react-icons/hi";
import { LuClipboardPenLine } from "react-icons/lu";
import { useState } from "react";
import {ClassScheduleModal} from "./ClassScheduleModal.tsx";

export function ClassListLayout() {
    const { id: activeCourseId } = useParams();
    const navigate = useNavigate();

    const [scheduleClassId, setScheduleClassId] = useState<string | null>(null);

    const { loading, error, classes, course } = useTeacherClasses();

    if (loading) return <LoadingPage title="Cargando..."/>

    return (
        <div className="flex flex-col lg:flex-row gap-3 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-1.8rem)]">
            <div className={`bg-white md:rounded-xl shadow-xs border border-gray-100 flex h-full flex-col ${activeCourseId ? 'hidden lg:flex' : 'flex'} lg:w-1/3 xl:w-1/4`}>
                <div className="flex flex-col h-full p-3 space-y-2">
                    {course ? (
                        <InteractiveHomeList
                            isActive={activeCourseId === course.id}
                            disabled={true}
                            onClick={() => navigate(`${course.id}`)}
                            avatarText={course.name ? course.name.replace("-", "") : "UNK"}
                            title={<span className="capitalize">Curso {course.name}</span>}
                            subtitle={`${course.total_students} Estudiantes`}
                        />
                    ) : (
                        <div className="w-full border border-dashed rounded-xl border-primary bg-primary-shadow/50 text-center px-2 py-4">
                            <p className="text-primary text-sm font-semibold">No tienes dirección de curso</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 m-4 text-sm">{error}</p>}

                    <hr className="w-full rounded-full border border-gray-100"/>

                    <div className="space-y-2 flex-1 overflow-y-auto styled-scrollbar overflow-x-hidden">
                        { classes.length === 0 && (
                            <div className="p-5 lg:p-10 text-center">
                                <p className="text-gray-500">No tienes clases asignadas en este momento.</p>
                            </div>
                        ) }

                        { classes.length > 0 && (
                            classes.map((item) => (
                                <InteractiveHomeList
                                    key={item.class_id}
                                    isActive={activeCourseId === item.class_id}
                                    onClick={() => navigate(`${item.class_id}`)}
                                    avatarText={item.course_name ? item.course_name.replace("-", "") : "UNK"}
                                    title={<span className="capitalize">{item.subject_name} • {item.course_name}</span>}
                                    subtitle={`${item.total_students} estudiantes`}
                                    menuOptions={[
                                        {
                                            label: "Ver asistencia",
                                            onClick: () => navigate(`/teacher/clases/${item.class_id}?button=see attendance`),
                                            icon: <HiOutlineClipboardList className="size-4" />
                                        },
                                        {
                                            label: "Ver notas",
                                            disabled: true,
                                            icon: <LuClipboardPenLine className="size-4" />
                                        },
                                        {
                                            label: "Asignar Horario",
                                            onClick: () => setScheduleClassId(item.class_id)
                                        }
                                    ]}
                                />
                            ))
                        ) }
                    </div>
                </div>
            </div>
            <div className={`bg-white md:rounded-xl shadow-xs border border-gray-100 flex-1 overflow-y-auto ${!activeCourseId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {activeCourseId ? (
                    <Outlet key={activeCourseId} />
                ) : ( <NoOutletInfo title="Selecciona una clase" paragraph="Haz clic en una clase de la lista para ver sus detalles y estudiante." /> )}
            </div>

            {scheduleClassId && (
                <ClassScheduleModal
                    mode={"create"}
                    classId={scheduleClassId}
                    onSuccess={() => {
                        setScheduleClassId(null);
                    }}
                    onClose={() => {
                        setScheduleClassId(null);
                    }}
                />
            )}
        </div>
    )
}