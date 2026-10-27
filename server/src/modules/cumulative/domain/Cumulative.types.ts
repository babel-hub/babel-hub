interface BaseStudent {
    student_id: string;
    student_first_name: string;
    student_first_last_name: string;
    student_middle_name: string | null;
    student_second_last_name: string | null;
}

interface BaseAttendance {
    present: number;
    absent: number;
    late: number;
    excused: number;
}

interface Subjects {
    class_id: string;
    scale_id: string;
    subject_name: string;
    final_grade: number;
}

export interface CumulativeGrades extends BaseStudent {
    period_average: number | null;
    subjects: Subjects[];
}

export interface CumulativeAttendance extends BaseStudent, BaseAttendance {}

export interface CumulativeSummary extends BaseStudent {
    period_average: number | null;
    scale_id: string | null;
    attendance_rate: number;
    total_absences: number;
    attendance: BaseAttendance;
}

export interface GetCumulativeRecordPayload {
    courseId: string;
    periodId: string;
    isActive: boolean;
}

export interface CoursePeriodTrend {
    period_id: string;
    period_name: string;
    period_start: string;
    course_average: number | null;
    graded_students: number;
}

export interface GetCourseTrendPayload {
    courseId: string;
    currentPeriodId: string;
}



export interface ReportCardStudent {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    course_name: string;
    enrollment_code: string | null;
}

export interface ReportCardPeriodCell {
    period_id: string;
    period_name: string;
    order: number;
    average: number | null;
    recovery: number | null;
    absences: number;
}

export interface ReportCardSubject {
    subject_id: string;
    subject_name: string;
    weekly_hours: number;
    periods: ReportCardPeriodCell[];
    total_absences: number;
    final_average: number | null;
}

export interface ReportCardArea {
    area_id: string;
    area_name: string;
    subjects: ReportCardSubject[];
}

export interface ReportCard {
    // --- Header Data ---
    school_name: string;
    school_code: string;
    school_logo_url: string | null;
    school_year: string;
    director_name: string;

    student: ReportCardStudent;
    periods: { id: string; name: string; order: number }[];

    // --- Body Data ---
    areas: ReportCardArea[];

    // --- Footer Data ---
    course_average: number;
    student_average: number;
    rank: number | null;

    // --- Meta ---
    generated_at: string;
}

export interface ReportStudentRow {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    enrollment_code: string | null;
    course_name: string;
}