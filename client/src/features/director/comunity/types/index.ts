export type Tabs = 'example 1' | 'example 2' | 'example 3';

export interface StudentProps {
    course_id: string;
    course_name: string;
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
    user_name: string;
    phone: string;
    is_active: boolean;
    enrollment_code: string | null;
    created_at: string;
}

export interface CreateStudent {
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    email: string;
    password: string;
    enrollmentCode: string;
    courseId: string
}

export interface UpdateStudent {
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    enrollmentCode: string;
    courseId: string
}

export interface Teacher {
    id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    is_active: boolean;
    email: string;
    created_at: string;
    total_classes: number;
}

export interface TeacherRowProps {
    teacher: Teacher;
    onEdit: (teacher: Teacher) => void;
    onDelete: (teacher: Teacher) => void;
    onNavigate: (id: string) => void;
}

export interface CreateTeacher {
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    password?: string;
    email?: string;
}

export interface UpdateTeacher {
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
}

export interface TeacherItem {
    teacher_id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    email: string;
    is_active: boolean;
    created_at: string;
}

export interface Courses {
    id: string;
    course_name: string;
    created_at: string;
    year: string;
    is_active: boolean;
    director_id: string;
    director_first_name: string;
    director_middle_name: string | null;
    director_first_last_name: string;
    director_second_last_name: string | null;
    student_count: number;
}

export interface ClassItem {
    class_id: string;
    subject_name: string;
    course_name: string;
}

export interface StudentSearchResult {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
}

interface LinkedStudent {
    link_id: string;
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    relationship_type: 'father' | 'mother' | 'other';
}

export interface Parent {
    parent_id: string;
    profile_id: string;
    parent_first_name: string;
    parent_middle_name: string | null;
    parent_first_last_name: string;
    parent_second_last_name: string | null;
    phone: string;
    user_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    students_count: number;
    students?: LinkedStudent[];
}

// Student profile interface

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
    grade_value: string | number;
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
    daily_status: string
}

export interface StudentProfileData {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    email: string;
    course_id: string;
    course_name: string;
    enrollment_code: string | null;
    user_name: string | null;
    phone: string | null;
    parents: LinkedParent[];
    recent_grades: GradeRecord[];
    current_classes: StudentClassRecord[];
    attendance_summary: AttendanceSummary[];
    is_active: boolean;
    created_at: string;
}