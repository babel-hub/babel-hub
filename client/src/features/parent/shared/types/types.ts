export type CumulativeGPATypes = 'attendance' | 'grades' | 'observations';

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