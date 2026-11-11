import api from "../../../api/client.ts";
import type { CourseSchedule } from "../types/types.ts";

export const getCourseSchedule = async (courseId: string, signal?: AbortSignal): Promise<CourseSchedule[]> => {
    const response = await api.get(`/courses/${courseId}/schedule`, { signal });
    return response.data.schedule;
}