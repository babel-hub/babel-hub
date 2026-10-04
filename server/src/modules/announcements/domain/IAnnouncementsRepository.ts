import type { AuthUser } from "../../shared/domain/Shared.types.ts";
import type { Announcement, CreateAnnouncementPayload, UpdateAnnouncementPayload } from "./Announcements.types.js";

export interface IAnnouncementsRepository {
    getFeed(
        schoolId: string,
        profileId: string,
        role: string,
        courseId?: string
    ): Promise<Announcement[]>;
    createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void>;
    updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void>;
    deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void>;
}