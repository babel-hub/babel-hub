export type UserRole = "principal" | "admin" | "teacher" | "student" | "parent" | null;
export type ModalModeTypes = 'create' | 'edit' | 'none';
export type StudentProfileTabTypes = 'general' | 'academic' | 'security';


interface NameInput {
    firstName: string;
    middleName?: string | null | undefined;
    firstLastName: string;
    secondLastName?: string | null | undefined;
}

export interface GradeScale {
    min: number;
    max: number;
    passing: number;
}

export interface Grades {
    id: string;
    student_id: string;
    assignment_id: string;
    value: number;
    comment: string | null;
}

export interface Assignment {
    id: string;
    name: string;
    due_date: string;
    created_at: string;
    grades: Grades[];
}

export interface AssessmentCriteria {
    id: string;
    name: string;
    weight: number;
    assignments: Assignment[];
}

export interface GradeRecords {
    studentId: string;
    value: number;
    comment: string | null;
}

export function reverseName(nameObj: NameInput): string {
    const lastNames = [nameObj.firstLastName, nameObj.secondLastName]
        .filter(Boolean)
        .join(" ");

    const firstNames = [nameObj.firstName, nameObj.middleName]
        .filter(Boolean)
        .join(" ");

    return [lastNames, firstNames].filter(Boolean).join(" ");
}

export const formatterDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});