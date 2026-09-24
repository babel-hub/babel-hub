import {useCallback, useState} from "react";
import { useAuth } from "../../../../auth/useAuth.ts";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule.ts";
import { useTeacherCalendar } from "../hooks/useTeacherCalendar.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { Schedule } from "../../../../components/ui/calendars/Schedule.tsx";
import { Calendar } from "../../../../components/ui/calendars/Calendar.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import {formatterDate } from "../../../../types";
import { LuBookOpen } from "react-icons/lu";
import type { TeacherSchedule } from "../types/types.ts";
import {ConfirmModal} from "../../../../components/ui/modals/ConfirmModal.tsx";
import {useDeleteSchedule} from "../hooks/useDeleteSchedule.ts";
import {TeacherModalForm} from "./TeacherModalForm.tsx";

export function TeacherClassesSchedule() {
    const { user } = useAuth();

    const [scheduleToEdit, setScheduleToEdit] = useState<TeacherSchedule | null>(null);
    const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(formatterDate.format(new Date()));

    const { loading, schedule, refetch } = useTeacherSchedule(user?.profile_id || "");
    const { loading: loadingDelete, deleteScheduleById } = useDeleteSchedule(refetch);

    const [viewingMonth, setViewingMonth] = useState(new Date());
    const { loading: loadingCalendar, monthActivities } = useTeacherCalendar(user?.profile_id || "", viewingMonth);

    const dailyActivities = monthActivities.filter(
        activity => activity.assignment_due_date.startsWith(selectedDate)
    );

    const handleEditClass = useCallback((schedule: TeacherSchedule) => {
        setScheduleToEdit(schedule);
    }, []);

    const handleDeleteClass = useCallback((scheduleId: string) => {
        setScheduleToDelete(scheduleId)
    }, []);

    if (loading) return <LoadingContent title="" />;
    if (!schedule || schedule.length === 0) return <NoResults title="No tienes horarios asignados" />;

    return (
        <div className="h-[calc(100dvh-4rem)] md:rounded-xl no-scrollbar md:h-[calc(100dvh-1.5rem)] grid lg:gap-3 grid-cols-1 lg:grid-cols-4">

            <div className="lg:col-span-3 overflow-auto no-scrollbar border border-gray-100 lg:rounded-xl h-full order-2 lg:order-1">
                <Schedule
                    schedule={schedule}
                    onEdit={handleEditClass}
                    onDelete={handleDeleteClass}
                />
            </div>

            <div className="relative lg:rounded-xl flex flex-col max-h-[36vh] lg:max-h-full h-full overflow-visible lg:overflow-hidden order-1 lg:order-2">
                <div className="flex flex-col lg:gap-5 h-full">

                    <div className="shrink-0">
                        <Calendar
                            schedule={schedule}
                            monthActivities={monthActivities}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            currentMonth={viewingMonth}
                            setCurrentMonth={setViewingMonth}
                            loading={loadingCalendar}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white lg:rounded-xl no-scrollbar">
                        {
                            dailyActivities.length > 0 ? (
                                <div className="flex flex-col gap-3 pt-0 pb-3 px-3 lg:p-3">
                                    <h4 className="font-bold text-custom-black text-sm">
                                        Acciones del Día
                                    </h4>
                                    {dailyActivities.map((activity) => (
                                        <div
                                            key={activity.assignment_id}
                                            className={`hover:bg-gray-50 flex flex-col gap-2 p-3.5 rounded-xl border border-gray-100 bg-white transition-all cursor-pointer
                                                        ${loadingCalendar ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                            <span className="text-sm font-bold text-gray-800 leading-tight capitalize transition-colors">
                                                {activity.subject_name}
                                            </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                                            <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                                                {activity.course_name}
                                            </span>
                                                <div className="flex items-center gap-1 capitalize">
                                                    <LuBookOpen className="size-3 text-gray-400" />
                                                    {activity.assignment_name}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center pb-5 justify-center text-center h-full opacity-70">
                                    <div className="hidden lg:block bg-gray-50 p-4 rounded-xl mb-3">
                                        <LuBookOpen className="size-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600">Nada programado</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                                        No tienes acciones para este día.
                                    </p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={scheduleToDelete !== null}
                onClose={() => setScheduleToDelete(null)}
                title="¿Estás seguro?"
                message={`¿Quieres eliminar este horario? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                    if (scheduleToDelete) {
                        await deleteScheduleById(scheduleToDelete);
                        setScheduleToDelete(null);
                    }
                }}
                loadingDelete={loadingDelete}
            />

            {scheduleToEdit && (
                <TeacherModalForm
                    initialData={scheduleToEdit}
                    onClose={() => setScheduleToEdit(null)}
                    onSuccess={async () => {
                        setScheduleToEdit(null);
                        refetch();
                    }}
                />
            )}
        </div>
    );
}