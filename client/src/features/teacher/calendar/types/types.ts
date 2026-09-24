export interface TeacherSchedule {
    id: string;
    course_id: string;
    course_name: string;
    class_id: string;
    subject_name: string;
    area_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
}

export interface AssignmentsByTeacherAndDate {
    assignment_id: string;
    assignment_name: string;
    assignment_created_at: string;
    assignment_due_date: string;
    course_id: string;
    course_name: string;
    class_id: string;
    subject_name: string;
    teacher_id: string;
}