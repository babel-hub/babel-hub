import api from "../../../../api/client.ts";
import type {DailyAttendance, StudentDailyGrade} from "../types/types.ts";

export const getStudentDailyAttendance = async (studentId: string, date: string): Promise<DailyAttendance[]> => {
    const response = await api.get(`parents/student/${studentId}/daily/attendance`, {
        params: {
            date
        }
    });
    return response.data.attendance;
}

export const getStudentDailyGrades = async (studentId: string, date: string): Promise<StudentDailyGrade[]> => {
    const response = await api.get(`parents/student/${studentId}/daily/grades`, {
        params: {
            date
        }
    });
    return response.data.grades;
}