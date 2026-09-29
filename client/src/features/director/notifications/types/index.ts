export interface AttendanceSummary {
    course_id: string;
    course_name: string;
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    total_absences: number;
    total_lates: number;
    is_red_alert: boolean;
}