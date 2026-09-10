export interface ClassFinalGrade {
    class_id: string;
    subject_name: string;
    final_grade: number;
    scale_max: number;
    scale_min: number;
    passing_value: number;
}

export interface DailyAttendance {
    class_id: string;
    class_name: string;
    status: 'no_data' | 'absent' | 'late' | 'excused' | 'present';
    recorded_at: string;
}