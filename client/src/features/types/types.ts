import type { AssessmentCriteria, Grades } from "../../types";

export type AttendanceStatus = 'absent' | 'late' | 'present' | 'excused' | 'no_data';
export type modeTypes = 'create' | 'edit';
export type TabTypes = 'students' | 'register attendance' | 'see attendance' | 'assignments';

export interface Scales {
    id: string;
    name: string;
    min_value: number;
    max_value: number;
    passing_value: number;
}

export interface Student {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    email: string;
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

interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
}

export interface StudentPeriodAttendance {
    student_id: string;
    firstName: string;
    middleName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    records: AttendanceRecord[];
}

export interface AssignmentsOverview {
    assessment_criteria: AssessmentCriteria[];
    grades: Grades[];
}