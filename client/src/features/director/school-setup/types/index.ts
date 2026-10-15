import type { Area } from "../../../../shared/types/types.ts";

export interface SubjectsProps {
    id: string;
    name: string;
    grading_template_id: string;
    grading_template_name: string;
}

export interface AreaDetails {
    area: Area;
    subjects: SubjectsProps[];
}

export interface GradingTemplate {
    id: string;
    name: string;
    school_id: string;
    scale_id: string;
    scale_min: string;
    scale_max: string;
}

export interface Assessment {
    id: string;
    name: string;
    weight: number;
    grading_template_id: string;
}

export interface GradingDetails {
    grading_name: string;
    assessments: Assessment[];
}