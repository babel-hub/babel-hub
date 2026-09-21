import { useAuth } from "../../../../auth/useAuth.ts";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule.ts";
import { LoadingContent } from "../../../../components/ui/Loadings.tsx";
import { CalendarGrid } from "../../../../components/ui/calendars/CalendarGrid.tsx";
import { NoResults } from "../../../../components/ui/blocks/NoResults.tsx";
import { useState } from "react";
import { Calendar } from "../../../../components/ui/calendars/Calendar.tsx";

export function TeacherClassesSchedule() {
    const { user } = useAuth();
    const { loading, schedule } = useTeacherSchedule(user?.profile_id || "");

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    if (loading) return <LoadingContent title="Loading your schedule..." />;
    if (!schedule || schedule.length === 0) return <NoResults title="No tienes horarios asignados" />;

    return (
        <div className="h-[calc(100dvh-4rem)] rounded-xl overflow-auto no-scrollbar md:h-[calc(100dvh-1.5rem)] grid gap-3 grid-cols-4">

            <div className="col-span-3">
                <CalendarGrid schedule={schedule} />
            </div>

            <div className="bg-white relative rounded-xl border border-gray-100 p-5">
                <div className="sticky flex flex-col gap-5 top-5">
                    <Calendar
                        schedule={schedule}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />

                    {selectedDate && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 capitalize">
                                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}