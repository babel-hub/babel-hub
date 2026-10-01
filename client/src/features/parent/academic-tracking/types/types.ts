interface DailyAttendance {
    class_id: string;
    class_name: string;
    start_time: string;
    end_time: string;
    room: string;
    status: 'no_data' | 'absent' | 'late' | 'excused' | 'present';
    recorded_at: string | null;
}

interface CourseBreakByDate {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
}

export interface TimelineClass extends DailyAttendance {
    type: "class";
}

interface TimelineBreak extends CourseBreakByDate {
    type: "break";
}

export type TimelineItem = TimelineClass | TimelineBreak;

export interface DailyScheduleWithBreaks {
    timeline: TimelineItem[];
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