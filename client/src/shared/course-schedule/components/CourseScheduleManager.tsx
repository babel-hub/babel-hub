import {useCourseSchedule} from "../hooks/useCourseSchedule.ts";
import {useParams} from "react-router-dom";
import {Schedule} from "../../../components/ui/calendars/Schedule.tsx";

export function CourseScheduleManager() {
    const { courseId } = useParams<{ courseId: string }>();

    const { schedule } = useCourseSchedule(courseId ?? "")

    return (
        <div className="h-[calc(100dvh-4rem)] md:rounded-xl no-scrollbar md:h-[calc(100dvh-1.5rem)]">
            <div className="overflow-auto no-scrollbar border border-gray-100 lg:rounded-xl h-full">
                <Schedule
                    schedule={schedule}
                    showCourse={false}
                    showTeacher
                />
            </div>
        </div>
    )
}