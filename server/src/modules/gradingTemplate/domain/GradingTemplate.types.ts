export interface GradingTemplate {
    id: string;
    name: string;
    school_id: string;
    scale_id: string;
    scale_min: string;
    scale_max: string;
}

export interface AssessmentCriteria {
    grading_name: string;
    assessments: {
        id: string;
        name: string;
        weight: number;
        grading_template_id: string;
    }[];
}

export interface GetGradingTemplateDetailsPayload {
    gradingId: string;
}

export interface CreateGradingTemplatePayload {
    gradingName: string;
    gradingScaleId: string;
}

export interface UpdateGradingTemplatePayload extends CreateGradingTemplatePayload {
    gradingId: string;
}

export interface DeleteGradingTemplatePayload {
    gradingId: string;
}