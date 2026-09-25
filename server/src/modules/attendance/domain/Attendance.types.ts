type Status = "no_data" | "absent" | "late" | "excused" | "present";

export interface ClassAttendance {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    status: 'absent' | 'late' | 'present' | 'excused' | null;
    date: string | null;
}

export interface StudentAttendanceRow {
    status: Status;
    count: string;
}

export interface CourseDailyAttendance {
    student_id: string;
    daily_status: Status;
}

export interface AttendanceSummary {
    course_id: string;
    course_name: string;
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    total_absences: number;
    total_lates: number;
}

export interface CalendarAttendance {
    date: string;
    daily_status: Status
}

export interface CourseAttendance {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    date: string;
    status: Status;
}

export interface BulkRecords {
    studentId: string,
    status: string
}

export interface DailyAttendance {
    class_id: string;
    class_name: string;
    status: Status;
    recorded_at: string;
}