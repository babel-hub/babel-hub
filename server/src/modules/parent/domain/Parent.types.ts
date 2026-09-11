export type RelationTypes = 'father' | 'mother' | 'other';

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
    email: string;
    is_active: boolean;
    created_at: string;
    students_count: number;
    students?: LinkedStudent[];
}

export interface ParentStudent {
    student_id: string;
    student_first_name: string;
    student_middle_name: string | null;
    student_first_last_name: string;
    student_second_last_name: string | null;
    relationship_type: 'father' | 'mother' | 'other';
    course_id: string;
    course_name: string;
}