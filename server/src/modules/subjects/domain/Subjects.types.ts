export interface SubjectDetails {
    area_id: string;
    area_name: string;
    id: string;
    name: string;
    grading_template_id: string;
    grading_template_name: string;
}

export interface CreateSubject {
    id: string;
}

export interface SubjectById {
    id: string;
    grading_template_id: string;
}

export interface AvailableSubjects {
    id: string;
    name: string;
}

export interface GetSubjectsByAreaPayload {
    subjectAreaId: string;
}

export interface GetAvailableSubjectsPayload {
    courseId: string;
}

export interface CreateSubjectPayload {
    subjectName: string;
    subjectAreaId: string;
    gradingTemplateId: string;
}

export interface UpdateSubjectPayload extends CreateSubjectPayload {
    subjectId: string;
}