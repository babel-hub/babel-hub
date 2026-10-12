export interface BaseAssessment {
    id: string;
    name: string;
    weight: number;
}

export interface Assessment extends BaseAssessment {
    grading_template_id: string;
}

export interface CreateAssessmentPayload {
    assessmentName: string;
    assessmentWeight: number;
    gradingTemplateId: string;
}

export interface UpdateAssessmentPayload extends CreateAssessmentPayload {
    assessmentId: string;
}