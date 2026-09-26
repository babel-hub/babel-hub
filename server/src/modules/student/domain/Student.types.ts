export interface Students {
    course_id: string;
    course_name: string;
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
    is_active: boolean;
    enrollment_code: string | null;
    created_at: string;
}

export interface CreateStudent {
    id: string;
}

export interface StudentByName{
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
}

// Student details interface

export interface LinkedParent {
    parent_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    phone: string | null;
    relationship_type: 'father' | 'mother' | 'other';
}

export interface GradeRecord {
    assignment_id: string;
    assignment_title: string;
    class_name: string;
    value: string | number;
    graded_at: Date;
}

export interface StudentClassRecord {
    class_id: string;
    subject_name: string;
    first_name: string;
    first_last_name: string;
}

export interface AttendanceSummary {
    date: string;
    daily_status: string;
}

export interface StudentBaseRow {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    email: string;
    is_active: boolean;
    created_at: Date;
    course_id: string;
    course_name: string;
    enrollment_code: string | null;
    user_name: string | null;
    phone: string | null;
}

export interface StudentProfileData extends StudentBaseRow {
    parents: LinkedParent[];
    recent_grades: GradeRecord[];
    current_classes: StudentClassRecord[];
    attendance_summary: AttendanceSummary[];
    is_active: boolean;
    created_at: Date;
}