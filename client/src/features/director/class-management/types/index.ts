import type { Student } from "../../../types/types.ts";

interface CLassDetails {
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

export interface ClassDetailsData {
    details: CLassDetails;
    students:   Student[];
}