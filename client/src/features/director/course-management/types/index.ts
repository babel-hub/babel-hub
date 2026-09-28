export interface ClassItem {
    is_active: boolean;
    class_id: string;
    subject_name: string;
    first_name: string;
    middle_name: string | null;
    first_last_name: string;
    second_last_name: string | null;
}

export interface Student {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    email: string;
    is_active: boolean;
}

export interface CoursesListData {
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

export interface UpsertCourse {
    name: string;
    year: string;
    teacherId: string;
}

export interface CreateClass {
    courseId: string;
    subjectId: string;
    teacherId: string;
}

export interface UpdateClass {
    teacherId: string;
}

export interface AvailableSubjects {
    id: string;
    name: string;
}

export interface Payload {
    name: string;
    year: string;
    teacherId: string;
}