type AnnouncementType = 'GENERAL' | 'EVENT' | 'EMERGENCY' | 'DEADLINE' | 'POLL';
type AnnouncementTargetType = 'ALL' | 'PROFILE' | 'ROLE' | 'COURSE';

export interface GetFeedParams {
    schoolId: string;
    viewerId: string;
    viewerRole: string;
    courseId?: string;
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
    target_type: AnnouncementTargetType;
    target_value: string[] | null;
}

export interface UpdateAnnouncementPayload extends CreateAnnouncementPayload {
    announcementId: string;
}