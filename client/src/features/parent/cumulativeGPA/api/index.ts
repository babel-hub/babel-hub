import api from "../../../../api/client.ts";
import type {
    ClassFinalGrade,
    DailyAttendance
} from "../types/types.ts";
import type { Period } from "../../../../shared/types/types.ts";

export const getStudentGrades = async (studentId: string, periodId: string): Promise<ClassFinalGrade[]> => {
    const response = await api.get(`parents/student/${studentId}/period/${periodId}/grades`);
    return response.data.grades;
}

export const getStudentAttendance = async (studentId: string, period: Period, date: string): Promise<DailyAttendance[]> => {
    const response = await api.get(`parents/student/${studentId}/attendance`, {
        params: {
            startDate: period.start_date,
            endDate: period.end_date,
            date
        }
    });
    return response.data.attendance;
}