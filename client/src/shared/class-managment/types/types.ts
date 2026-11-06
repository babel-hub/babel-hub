import type { AttendanceStatus, Severity, Student } from "../../../features/types/types.ts";

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

export interface UpsertInfractionPayload {
    infractionTypeId: string;
    description: string | null;
    escalate?: boolean;
    monitoringNotes?: string | null;
    studentId: string;
}