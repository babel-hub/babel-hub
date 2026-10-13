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
    attendance_rate: number;
    total_absences: number;
    attendance: BaseAttendance;
}

export interface GetCumulativeRecordPayload {
    courseId: string;
    periodId: string;
    isActive: boolean;
}