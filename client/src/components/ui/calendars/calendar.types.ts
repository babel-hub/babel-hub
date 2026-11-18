export interface ScheduleEntry {
    id: string;
    course_id: string;
    course_name: string;
    class_id: string;
    class_name: string;
    area_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
    teacher_name?: string;
}

export type TeacherSchedule = ScheduleEntry;
export type CourseSchedule = ScheduleEntry;