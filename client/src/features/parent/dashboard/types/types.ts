export type AttendanceDayStatus = "present" | "late" | "absent" | "excused";

export interface ChildSubjectGrade {
    subject_id: string;
    subject_name: string;
    teacher_name: string;
    current_grade: number | null;
    last_activity_title: string | null;
    last_activity_grade: number | null;
    last_activity_date: string | null;
}

export interface AttendanceDayLog {
    date: string;
    status: AttendanceDayStatus;
    subject_name?: string | null;
    note?: string | null;
}

export interface UpcomingAssignment {
    id: string;
    subject_name: string;
    title: string;
    due_date: string;
    type: "tarea" | "examen" | "proyecto" | "taller";
    status: "pending" | "submitted";
}

export interface ObservadorEntry {
    id: string;
    occurred_at: string;
    infraction_type: string;
    article_label: string;
    location_context: string;
    description: string;
    reported_by: string;
    has_monitoring: boolean;
    monitoring_id: string | null;
    monitoring_messages_count: number;
    latest_monitoring_note: string | null;
}

export interface ParentAnnouncement {
    id: string;
    title: string;
    type: string;
    scope: "colegio" | "curso";
    published_at: string;
    summary: string;
}

export interface ChildDashboardProfile {
    student_id: string;
    full_name: string;
    course_name: string;
    period_name: string;
    director_name: string | null;
    period_average: number | null;
    attendance: {
        rate: number;
        total_absences: number;
        total_lates: number;
        total_excused: number;
        recent_days: AttendanceDayLog[];
        recent_incidents: AttendanceDayLog[];
    };
    subjects: ChildSubjectGrade[];
    upcoming_assignments: UpcomingAssignment[];
    observador: ObservadorEntry[];
    announcements: ParentAnnouncement[];
}

export interface ParentDashboardData {
    parent_name: string;
    children: ChildDashboardProfile[];
}