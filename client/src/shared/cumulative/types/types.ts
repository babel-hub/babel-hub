export type TabCumulativeTypes = 'attendance' | 'grades' | 'absents' | 'summary' | 'reports';

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

export interface CumulativeAttendance extends BaseStudent, BaseAttendance {}

export interface CumulativeMetrics {
    activeStudents: number;
    overallAverage: number;
    attendanceRate: number;
    totalAbsences: number;
}

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

export interface ReportStudentRow extends BaseStudent {
    enrollment_code: string | null;
    course_name: string;
}

export interface CourseFailStat {
    failCount: number;
    studentCount: number;
}

export interface HonorStudent extends BaseStudent {
    rank: number;
    period_average: number;
}