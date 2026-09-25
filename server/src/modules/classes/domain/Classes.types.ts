interface Student {
    student_id: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
    email: string;
}

export interface StudentClassRow {
    class_id: string;
    subject_name: string;
    first_name: string;
    first_last_name: string;
}

interface ClassInfo {
    id: string;
    course_id: string;
    course_name: string;
    subject_name: string;
    teacher_id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    created_at: string;
}

export interface ClassDetails {
    details: ClassInfo;
    students: Student[];
}

export interface CreateClass {
    id: string;
}

export interface TeacherClasses {
    class_id: string;
    subject_name: string;
    course_id: string;
    course_name: string;
    total_students: number;
}

export interface TeacherClassDetails {
    course_id: string;
    course_name: string;
    subject_name: string;
    total_students: number;
    students: Student[];
}