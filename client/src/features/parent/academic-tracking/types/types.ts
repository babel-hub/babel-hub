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