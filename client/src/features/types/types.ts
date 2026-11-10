import type { ClassItem } from "../director/course-management/types";

export type AttendanceStatus = 'absent' | 'late' | 'present' | 'excused' | 'no_data';
export type modeTypes = 'create' | 'edit';
export type TabTypes = 'students' | 'register attendance' | 'see attendance' | 'assignments';
export type Severity = "low" | "medium" | "high";

export interface Student {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
    is_active: boolean;
}

export interface CourseDataProps {
    course: {
        is_active: boolean;
        id: string;
        course_name: string;
        year: string;
        created_at: string;
    };
    students: Student[];
    classes: ClassItem[];
}

export interface CourseDailyAttendance {
    student_id: string;
    daily_status: 'absent' | 'late' | 'present' | 'excused' | 'no_data';
}