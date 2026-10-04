import api from "../../api/client.ts";
import type {
    Announcement,
    Area,
    CreateAnnouncementPayload,
    Period,
    Teacher,
    UpdateAnnouncementPayload
} from "../types/types.ts";


export const getTeachers = async (): Promise<Teacher[]> => {
    const response = await api.get(`/teacher`);
    return response.data.teachers
}

export const getPeriods = async (): Promise<Period[]> => {
    const response = await api.get('/periods');
    return response.data.periods;
};

export const getAreas = async (): Promise<Area[]> => {
    const response = await api.get("/areas");
    return response.data.areas;
}

// Announcements

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