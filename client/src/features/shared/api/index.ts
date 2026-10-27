import api from "../../../api/client.ts";
import type {CourseDailyAttendance, CourseDataProps} from "../../types/types.ts";

export const getCourse = async (id: string, controller: any): Promise<CourseDataProps> => {
    const response = await api.get(`/courses/${id}`, { signal: controller.signal });
    return response.data;
}

export const getAttendance  = async (id: string, date: string, controller: any): Promise<CourseDailyAttendance[]> => {
    const response = await api.get(`/attendance/course/${id}/summary?date=${date}`, { signal: controller.signal });
    return response.data.records;
}