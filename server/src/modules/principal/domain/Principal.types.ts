import type { UserCredentialsForm } from "../../shared/domain/Shared.types.js";

export interface CreatePrincipalPayload extends UserCredentialsForm {}

export interface Alert {
    severity: "error" | "warning" | "info";
    message: string;
    count: number;
}

export interface StudentStats {
    total: number;
    active: number;
}

export interface TeacherStats {
    total: number;
    active: number;
    without_classes: number;
}

export interface UpcomingAnnouncement {
    id: string;
    title: string;
    type: string;
    scheduled_for: string;
    status: "scheduled" | "published";
}

export interface AttendanceAlert {
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

export interface CourseOverview {
    course_id: string;
    course_name: string;
    students_count: number;
    attendance_rate: number;
    period_average: number | null;
    monitorings_count: number;
    director_name: string | null;
}

export interface PrincipalDashboard {
    kpis: {
        students: StudentStats;
        teachers: TeacherStats;
    };
    alerts: Alert[];
    upcoming_announcements: UpcomingAnnouncement[];
    attendance_alerts: AttendanceAlert[];
    courses_overview: CourseOverview[];
    school_average: number | null;
}