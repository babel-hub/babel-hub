export interface Teacher {
    id: string;
    teacher_first_name: string;
    teacher_middle_name: string | null;
    teacher_first_last_name: string;
    teacher_second_last_name: string | null;
    is_active: boolean;
    email: string;
    created_at: string;
    total_classes: number;
}

export interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

export interface Area {
    id: string;
    school_id: string;
    name: string;
}

export interface Scale {
    id: string;
    name: string;
    min_value: number;
    max_value: number;
    passing_value: number;
}