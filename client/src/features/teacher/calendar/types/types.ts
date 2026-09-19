export interface TeacherSchedule {
    course_id: string;
    course_name: string;
    class_id: string;
    subject_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
}