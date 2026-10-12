import type { AuthUser } from "../../shared/domain/Shared.types.js";
import type {
    Announcement,
    CreateAnnouncementPayload, GetFeedPayload,
    UpdateAnnouncementPayload
} from "./Announcements.types.js";

export interface IAnnouncementsRepository {
    getFeed(payload: GetFeedPayload, authUser: AuthUser): Promise<Announcement[]>;
    createAnnouncement(payload: CreateAnnouncementPayload, authUser: AuthUser): Promise<void>;
    updateAnnouncement(payload: UpdateAnnouncementPayload, authUser: AuthUser): Promise<void>;
    deleteAnnouncement(announcementId: string, authUser: AuthUser): Promise<void>;
}