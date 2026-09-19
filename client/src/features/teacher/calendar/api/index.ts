import api from "../../../../api/client.ts";

export const getTeacherSchedule = async (teacherId: string) => {
    const response = await api.get(`/teacher/${teacherId}/schedule`);
    return response.data.schedule;
}