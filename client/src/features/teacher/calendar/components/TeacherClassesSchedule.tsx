import { useState } from "react";
import { useAuth } from "../../../../auth/useAuth.ts";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule.ts";
import { useTeacherCalendar } from "../hooks/useTeacherCalendar.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { CalendarGrid } from "../../../../components/ui/calendars/CalendarGrid.tsx";
import { Calendar } from "../../../../components/ui/calendars/Calendar.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { formatterDate } from "../../../../types";
import { LuBookOpen } from "react-icons/lu";

export function TeacherClassesSchedule() {
    const { user } = useAuth();

    const [selectedDate, setSelectedDate] = useState<string>(formatterDate.format(new Date()));
    const { loading, schedule } = useTeacherSchedule(user?.profile_id || "");

    const [viewingMonth, setViewingMonth] = useState(new Date());
    const { loading: loadingCalendar, monthActivities } = useTeacherCalendar(user?.profile_id || "", viewingMonth);

    const dailyActivities = monthActivities.filter(
        activity => activity.assignment_due_date.startsWith(selectedDate)
    );

    if (loading) return <LoadingContent title="" />;
    if (!schedule || schedule.length === 0) return <NoResults title="No tienes horarios asignados" />;

    return (
        <div className="h-[calc(100dvh-4rem)] md:rounded-xl overflow-auto no-scrollbar md:h-[calc(100dvh-1.5rem)] grid gap-3 grid-cols-1 md:grid-cols-4">

            <div className="md:col-span-3 md:h-full order-2 md:order-1">
                <CalendarGrid schedule={schedule} />
            </div>

            <div className="bg-white relative md:rounded-xl border border-gray-100 p-5 flex flex-col h-[570px] md:h-full overflow-hidden order-1 md:order-2">
                <div className="flex flex-col gap-5 h-full">

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

                    <hr className="border-gray-100 w-full" />

                    <div className="flex-1 overflow-y-auto styled-scrollbar pr-2">
                        {loadingCalendar ? (
                            <LoadingContent title="" />
                        ) : dailyActivities.length > 0 ? (
                            <div className="flex flex-col gap-3 pb-4">
                                <h4 className="text-sm font-semibold text-gray-400 mb-1">
                                    Pendientes del Día
                                </h4>
                                {dailyActivities.map((activity) => (
                                    <div
                                        key={activity.assignment_id}
                                        className="hover:bg-gray-50 flex flex-col gap-2 p-3.5 rounded-xl border border-gray-100 bg-white transition-all cursor-pointer"
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
                            <div className="flex flex-col items-center justify-center text-center mt-8 opacity-70">
                                <div className="bg-gray-50 p-4 rounded-xl mb-3">
                                    <LuBookOpen className="size-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">Nada programado</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                                    No tienes asignaciones pendientes para este día.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}