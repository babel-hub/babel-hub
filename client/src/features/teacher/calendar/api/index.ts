import api from "../../../../api/client.ts";
import type {AssignmentsByTeacherAndDate, TeacherSchedule} from "../types/types.ts";

export const getTeacherSchedule = async (teacherId: string): Promise<TeacherSchedule[]> => {
    const response = await api.get(`/teacher/${teacherId}/schedule`);
    return response.data.schedule;
}

export const getTeacherCalendar = async (teacherId: string, startDate: string, endDate: string): Promise<AssignmentsByTeacherAndDate[]> => {
    const response = await api.get(`/teacher/${teacherId}/calendar`, {
        params: {
            startDate,
            endDate
        }
    });
    return response.data.calendar;
}