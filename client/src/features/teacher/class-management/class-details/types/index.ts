import type { Student } from "../../../../types/types.ts";

export interface ClassDetailsData {
    course_id: string;
    course_name: string;
    subject_name: string;
    total_students: number;
    students: Student[];
}