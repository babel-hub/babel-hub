export type Tabs = "infractions" | "monitoring";

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