import type { AttendanceStatus, Student } from "../../../features/types/types.ts";
import type { AssessmentCriteria, Grades } from "../../../types";
import type { Scale } from "../../global/types/types.ts";

interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
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

export interface AssignmentsOverview {
    assessment_criteria: AssessmentCriteria[];
    grades: Grades[];
    scale: Scale;
}

export interface StudentPeriodAttendance {
    student_id: string;
    firstName: string;
    middleName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    records: AttendanceRecord[];
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

export interface PrincipalClassDetails {
    id: string;
    course_id: string;
    course_name: string;
    subject_name: string;
    teacher_id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    created_at: string;
}

export interface PrincipalClassData {
    details: PrincipalClassDetails;
    students: Student[];
}

export interface TeacherClassData {
    course_id: string;
    course_name: string;
    subject_name: string;
    total_students: number;
    students: Student[];
}

export type SharedClassData = PrincipalClassData | TeacherClassData;