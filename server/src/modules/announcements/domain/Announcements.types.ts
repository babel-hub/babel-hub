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
}

export interface CreateAnnouncementPayload {
    title: string;
    description: string;
    type: AnnouncementType;
}

export interface UpdateAnnouncementPayload extends CreateAnnouncementPayload {
    announcementId: string;
    target_type: AnnouncementTargetType;
}