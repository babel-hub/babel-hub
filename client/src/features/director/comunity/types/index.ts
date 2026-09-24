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

export interface StudentRowProps {
    student: StudentProps;
    onEdit: (student: StudentProps) => void;
    onDelete: (student: StudentProps) => void;
    onNavigate: (id: string) => void;
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

export interface GradeRecord {
    assignment_id: string;
    assignment_title: string;
    class_name: string;
    grade_value: number;
    graded_at: string;
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