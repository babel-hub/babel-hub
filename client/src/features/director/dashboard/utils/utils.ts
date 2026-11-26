import type {CourseOverview} from "../types/types.ts";

export const PASSING_AVERAGE = 3.5;
const MIN_ATTENDANCE_ALERT = 80;
const HEALTHY_ATTENDANCE = 90;

export function isCourseFlagged(course: CourseOverview): boolean {
    if (course.students_count === 0) return false;
    const lowAttendance = course.attendance_rate < MIN_ATTENDANCE_ALERT;
    const lowAverage =
        course.period_average !== null && course.period_average < PASSING_AVERAGE;
    return lowAttendance || lowAverage;
}

export function getAttendanceStatus(course: CourseOverview) {
    if (course.students_count === 0) {
        return { dot: "bg-slate-300", text: "text-slate-400", label: "—" };
    }
    if (course.attendance_rate < MIN_ATTENDANCE_ALERT) {
        return {
            dot: "bg-rose-500",
            text: "text-rose-700",
            label: `${course.attendance_rate.toFixed(1)}%`,
        };
    }
    if (course.attendance_rate < HEALTHY_ATTENDANCE) {
        return {
            dot: "bg-amber-400",
            text: "text-amber-700",
            label: `${course.attendance_rate.toFixed(1)}%`,
        };
    }
    return {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        label: `${course.attendance_rate.toFixed(1)}%`,
    };
}