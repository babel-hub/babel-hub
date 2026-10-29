import api from "../../api/client.ts";
import type {
    Announcement,
    Area, CoursePeriodTrend,
    CreateAnnouncementPayload, CumulativeAttendance, CumulativeGrades, CumulativeSummary,
    Period, ReportStudentRow, Scale,
    Teacher,
    UpdateAnnouncementPayload, UserSearch
} from "../types/types.ts";

import type { CoursesListData } from "../../features/director/course-management/types";


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

export const getScales = async (): Promise<Scale[]> => {
    const response = await api.get(`/scales`);
    return response.data.scales;
}
// Announcements

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

// Cumulative
export const getPeriodTrends = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<CoursePeriodTrend[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/trend`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.trend;
}


export const getCumulativeSummary = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<CumulativeSummary[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/summary`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.summary;
}

export const getCumulativeGrades = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<CumulativeGrades[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/grades`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.grades;
}

export const getCumulativeAttendance = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<CumulativeAttendance[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/attendance`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.attendance;
}

export const getCumulativeReports = async (courseId: string, signal?: AbortSignal): Promise<ReportStudentRow[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/reports/students`, { signal });
    return response.data.students;
}