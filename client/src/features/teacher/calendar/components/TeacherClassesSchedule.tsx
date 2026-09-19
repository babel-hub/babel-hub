import { useAuth } from "../../../../auth/useAuth.ts";
import { useTeacherSchedule } from "../hooks/useTeacherSchedule.ts";
import {LoadingContent} from "../../../../components/ui/Loadings.tsx";
import {CalendarGrid} from "../../../../components/ui/calendars/CalendarGrid.tsx";


export function TeacherClassesSchedule() {
    const { user } = useAuth();
    const { loading, schedule } = useTeacherSchedule(user?.profile_id || "");

    if (loading) {
        return <LoadingContent title="Loading your schedule..." />;
    }

    if (!schedule || schedule.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-500">No tienes horarios asignados</p>
            </div>
        );
    }

    return (
        <CalendarGrid schedule={schedule} />
    );
}