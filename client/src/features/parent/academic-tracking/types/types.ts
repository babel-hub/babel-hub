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
    scale_min: number;
    scale_passing: number;
    breakdown: CriteriaBreakdown[];
}