import type { AssessmentCriteria, Grades } from "../../types";
import type {ClassItem} from "../director/course-management/types";

export type AttendanceStatus = 'absent' | 'late' | 'present' | 'excused' | 'no_data';
export type modeTypes = 'create' | 'edit';
export type TabTypes = 'students' | 'register attendance' | 'see attendance' | 'assignments';
export type Severity = "low" | "medium" | "high";

export interface Scale {
    id: string;
    name: string;
    min_value: number;
    max_value: number;
    passing_value: number;
}

export interface Student {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
    is_active: boolean;
}

export interface ClassAttendance {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    status: AttendanceStatus;
    date: string | null;
}

export interface CourseAttendance {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    date: string;
    status: AttendanceStatus;
}

export interface AssignmentsOverview {
    assessment_criteria: AssessmentCriteria[];
    grades: Grades[];
    scale: Scale;
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

export interface StudentInfraction {
    id: string;
    student_id: string;
    class_id: string;
    infraction_type_id: string;
    infraction_name: string;
    severity: Severity;
    description: string | null;
    reported_by: string;
    reported_by_name: string;
    created_at: string;
}

export interface StudentMonitoring {
    id: string;
    infraction_id: string;
    student_id: string;
    course_id: string;
    course_name: string;
    notes: string | null;
    infraction_name: string;
    severity: Severity;
    description: string | null;
    reported_by: string;
    reported_by_name: string;
    created_at: string;
}

export interface InfractionType {
    id: string;
    name: string;
    severity: Severity;
}