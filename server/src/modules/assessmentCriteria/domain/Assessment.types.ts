export interface BaseAssessment {
    id: string;
    name: string;
    weight: number;
}

export interface Assessment extends BaseAssessment {
    grading_template_id: string;
}