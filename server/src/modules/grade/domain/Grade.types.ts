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