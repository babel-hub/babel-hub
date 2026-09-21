import api from "../../../../api/client.ts";
import type { TeacherSchedule } from "../types/types.ts";

export const getTeacherSchedule = async (teacherId: string): Promise<TeacherSchedule[]> => {
    const response = await api.get(`/teacher/${teacherId}/schedule`);
    return response.data.schedule;
}