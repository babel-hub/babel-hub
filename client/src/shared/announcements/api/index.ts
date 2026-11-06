import api from "../../../api/client";
import type { CoursesListData } from "../../../features/director/course-management/types/index.ts";
import type {
    Announcement,
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload,
    UserSearch
} from "../types/types.ts";


export const getUsers = async (query: string): Promise<UserSearch[]> => {
    const response = await api.get("/user/search", {
        params: {
            q: query,
            limit: 10
        }
    });
    return response.data.users;
}

export const getCourses = async (): Promise<CoursesListData[]> => {
    const response = await api.get("/courses");
    return response.data.courses;
}

export const getAnnouncements = async (courseId: string | null, profileId: string): Promise<Announcement[]> => {
    const response = await api.get(`/announcements`, {
        params: { courseId, profileId }
    });
    return response.data.feed;
}

export const createAnnouncement = async (payload: CreateAnnouncementPayload): Promise<void> => {
    return await api.post(`/announcements`, payload);
}

export const updateAnnouncement = async (announcementId: string, payload: Omit<UpdateAnnouncementPayload, 'announcementId'>): Promise<void> => {
    return await api.put(`/announcements/${announcementId}`, payload);
}

export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
    return await api.delete(`/announcements/${announcementId}`);
}
