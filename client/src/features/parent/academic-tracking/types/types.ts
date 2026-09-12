export interface DailyAttendance {
    class_id: string;
    class_name: string;
    status: 'no_data' | 'absent' | 'late' | 'excused' | 'present';
    recorded_at: string;
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
    weight: number;   // e.g. 40 for 40%
    average: number;  // this criteria's average so far, on the class's scale
}

export interface SubjectAccumulated {
    subject_name: string;
    period_average: number;
    scale_max: number;
    breakdown: CriteriaBreakdown[];
}

export const MOCK_ACCUMULATED: SubjectAccumulated = {
    subject_name: "Matemáticas",
    period_average: 4.2,
    scale_max: 5,
    breakdown: [
        { criteria_name: "Talleres",  weight: 40, average: 4.5 },
        { criteria_name: "Parciales", weight: 35, average: 3.8 },
        { criteria_name: "Examen",    weight: 15, average: 4.9 },
        { criteria_name: "Actitud",   weight: 10, average: 4.0 },
    ],
};