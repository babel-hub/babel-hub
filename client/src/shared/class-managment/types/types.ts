import type { AttendanceStatus, Student } from "../../../features/types/types.ts";
import type { AssessmentCriteria, Grades } from "../../../types";
import type { Scale } from "../../global/types/types.ts";

export type Tabs = "infractions" | "monitoring";
export type SeverityLevel = "Tipo 1" | "Tipo 2" | "Tipo 3";

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



// Infractions - Monitoring

export interface StudentInfraction {
    id: string;
    student_id: string;
    class_id: string;
    infraction_type_name: string;
    infraction_type_order: number;
    infraction_article_name: string;
    infraction_code_name: string;
    infraction_code_number: string;
    infraction_code_id: string;
    description: string | null;
    reported_by: string;
    reported_by_name: string;
    created_at: string;
    class_name?: string;
}

export interface StudentMonitoring {
    id: string;
    infraction_id: string;
    student_id: string;
    course_id: string;
    course_name: string;
    notes: string | null;
    infraction_type_name: string;
    infraction_type_order: number;
    infraction_article_name: string | null;
    infraction_code_id: string;
    infraction_code_name: string;
    infraction_code_number: number;
    description: string | null;
    reported_by: string;
    reported_by_name: string;
    message_count: number;
    created_at: string;
}

export interface InfractionCode {
    id: string;
    number: number;
    name: string;
}

export interface InfractionArticle {
    id: string;
    number: number;
    name: string | null;
    codes: InfractionCode[];
}

export interface InfractionTypeHierarchy {
    id: string;
    name: string;
    order_index: number;
    articles: InfractionArticle[];
}

export interface UpsertInfractionPayload {
    codeId: string;
    description: string | null;
    escalate?: boolean;
    monitoringNotes?: string | null;
    studentId: string;
}

export interface MonitoringMessage {
    id: string;
    monitoring_id: string;
    profile_id: string;
    profile_name: string;
    message: string;
    is_deleted: boolean;
    created_at: string;
}