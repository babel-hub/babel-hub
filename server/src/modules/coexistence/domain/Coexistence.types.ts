export type Severity = "low" | "medium" | "high";

export interface GetStudentInfractionsPayload {
    studentId: string;
    classId: string;
}

export interface GetStudentMonitoringPayload {
    studentId: string;
    courseId: string;
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

export interface CreateInfractionPayload {
    studentId: string;
    infractionTypeId: string;
    description: string | null;
    escalate: boolean;
    monitoringNotes?: string | null;
}

export interface UpdateInfractionPayload {
    infractionId: string;
    studentId: string;
    infractionTypeId: string;
    description: string | null;
    escalate: boolean;
    monitoringNotes?: string | null;
}