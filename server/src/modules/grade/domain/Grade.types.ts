export interface GradeRecord {
    studentId: string;
    value: number;
    comment: string | null;
    periodId: string;
}

export interface ValidScales {
    min_value: number;
    max_value: number;
}

export interface StudentGradeRow {
    assignment_id: string;
    assignment_title: string;
    class_name: string;
    value: string | number;
    graded_at: Date;
}

export interface GradeByAssignment {
    id: string;
    student_id: string;
    assignment_id: string;
    value: number;
    comment: string | null;
}

export interface StudentGrade {
    class_id: string;
    subject_name: string;
    final_grade: number;
    scale_max: number;
    scale_min: number;
    passing_value: number;
}

export interface StudentDailyGrade {
    class_id: string;
    subject_name: string;
    assignment_id: string;
    assignment_name: string;
    criteria_name: string;
    grade: number;
    comment: string | null;
    graded_at: string;
}

export interface CriteriaBreakdown {
    criteria_name: string;
    weight: number;
    average: number;
}

export interface SubjectAccumulated {
    subject_name: string;
    period_average: number;
    scale_max: number;
    scale_min: number;
    scale_passing: number;
    breakdown: CriteriaBreakdown[];
}