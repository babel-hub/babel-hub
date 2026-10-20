export interface Teacher {
    id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    is_active: boolean;
    email: string;
    created_at: string;
    total_classes: number;
}

export interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

export interface Area {
    id: string;
    school_id: string;
    name: string;
}

export interface Scale {
    id: string;
    name: string;
    min_value: number;
    max_value: number;
    passing_value: number;
}

// Announcements

type AnnouncementType = 'GENERAL' | 'EVENT' | 'EMERGENCY' | 'DEADLINE' | 'POLL';
type AnnouncementTargetType = 'ALL' | 'PROFILE' | 'ROLE' | 'COURSE';

export interface Announcement {
    id: string;
    author: string;
    title: string;
    type: AnnouncementType;
    description: string;
    target_type: AnnouncementTargetType;
    created_at: string;
    caption: string | null;
}

export interface CreateAnnouncementPayload {
    title: string;
    description: string;
    type: AnnouncementType;
    caption: string | null;
}

export interface UpdateAnnouncementPayload extends CreateAnnouncementPayload {
    announcementId: string;
    target_type: AnnouncementTargetType;
    caption: string | null;
}

export interface UserSearch {
    id: string;
    first_name: string;
    middle_name: string;
    first_last_name: string;
    second_last_name: string;
    role: string;
}

// Cumulative

export type TabCumulativeTypes = 'attendance' | 'grades' | 'absents' | 'summary';

interface BaseStudent {
    student_id: string;
    student_first_name: string;
    student_first_last_name: string;
    student_middle_name: string | null;
    student_second_last_name: string | null;
}


export interface CumulativeMetrics {
    activeStudents: number;
    overallAverage: number;
    attendanceRate: number;
    totalAbsences: number;
}

interface BaseAttendance {
    present: number;
    absent: number;
    late: number;
    excused: number;
}

export interface CumulativeAttendance extends BaseStudent, BaseAttendance {}

export interface Subjects {
    class_id: string;
    scale_id: string;
    subject_name: string;
    final_grade: number;
}

export interface CumulativeGrades extends BaseStudent {
    period_average: number | null;
    subjects: Subjects[];
}

export interface CumulativeSummary extends BaseStudent {
    period_average: number | null;
    scale_id: string | null;
    attendance_rate: number;
    total_absences: number;
    attendance: BaseAttendance;
}

export interface CoursePeriodTrend {
    period_id: string;
    period_name: string;
    period_start: string;
    course_average: number | null;
    graded_students: number;
}