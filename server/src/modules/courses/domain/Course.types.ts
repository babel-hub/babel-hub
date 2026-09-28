interface BaseCourse {
    is_active: boolean;
    id: string;
    course_name: string;
    year: string;
    created_at: string;
}

export interface Courses extends BaseCourse {
    director_id: string;
    director_first_name: string;
    director_middle_name: string | null;
    director_first_last_name: string;
    director_second_last_name: string | null;
    student_count: number;
}

export interface Course extends BaseCourse {}

export interface CourseDetails {
    course: BaseCourse;
    students: {
        student_id: string;
        student_first_name: string;
        student_middle_name: string | null;
        student_first_last_name: string;
        student_second_last_name: string | null;
        email: string;
        is_active: boolean;
    }[];
    classes: {
        is_active: boolean;
        class_id: string;
        subject_name: string;
        first_name: string;
        middle_name: string | null;
        first_last_name: string;
        second_last_name: string | null;
    }[];
}

export interface TeacherCourse {
    id: string;
    name: string;
    total_students: number;
}

export interface CreateCourse {
    id: string;
}

export interface UpdateCourse {
    id: string;
    name: string;
}
