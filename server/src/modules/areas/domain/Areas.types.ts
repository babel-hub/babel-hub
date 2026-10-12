export interface Area {
    id: string;
    name: string;
    school_id: string;
}

interface Subjects {
    area_id: string;
    area_name: string;
    id: string;
    name: string;
    grading_template_id: string;
    grading_template_name: string;
}

export interface AreaDetails {
    area: Area;
    subjects: Subjects[];
}

export interface CreateAreaPayload {
    name: string;
}

export interface UpdateAreaPayload extends CreateAreaPayload {
    areaId: string;
}