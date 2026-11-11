export interface CourseSchedule {
    id: string;
    course_id: string;
    course_name: string;
    class_id: string;
    class_name: string;
    teacher_id: string;
    teacher_name: string;
    area_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
}