type AnnouncementType = 'GENERAL' | 'EVENT' | 'EMERGENCY' | 'DEADLINE' | 'POLL';
type AnnouncementTargetType = 'ALL' | 'PROFILE' | 'ROLE' | 'COURSE';

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