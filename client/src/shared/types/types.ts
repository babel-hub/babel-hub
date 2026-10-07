type AnnouncementType = 'GENERAL' | 'EVENT' | 'EMERGENCY' | 'DEADLINE' | 'POLL';
type AnnouncementTargetType = 'ALL' | 'PROFILE' | 'ROLE' | 'COURSE';

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

export interface Announcement {
    id: string;
    author: string;
    title: string;
    type: AnnouncementType;
    description: string;
    target_type: AnnouncementTargetType;
    created_at: string;
    caption: string | null;
}

export interface CreateAnnouncementPayload {
    title: string;
    description: string;
    type: AnnouncementType;
    caption: string | null;
}

export interface UpdateAnnouncementPayload extends CreateAnnouncementPayload {
    announcementId: string;
    target_type: AnnouncementTargetType;
    caption: string | null;
}

export interface UserSearch {
    id: string;
    first_name: string;
    middle_name: string;
    first_last_name: string;
    second_last_name: string;
    role: string;
}