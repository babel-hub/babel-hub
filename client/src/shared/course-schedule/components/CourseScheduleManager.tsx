import {useCourseSchedule} from "../hooks/useCourseSchedule.ts";
import {useParams} from "react-router-dom";

export function CourseScheduleManager() {
    const { courseId } = useParams<{ courseId: string }>();

    const { schedule } = useCourseSchedule(courseId ?? "")

    console.log(schedule);
    return (
        <>Manager</>
    )
}