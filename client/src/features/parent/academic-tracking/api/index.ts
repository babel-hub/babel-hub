import api from "../../../../api/client.ts";
import type {DailyAttendance, StudentDailyGrade, SubjectAccumulated} from "../types/types.ts";

export const getStudentDailyAttendance = async (studentId: string, date: string, signal?: AbortSignal): Promise<DailyAttendance[]> => {
    const response = await api.get(`parents/student/${studentId}/daily/attendance`, {
        params: { date },
        signal
    });
    return response.data.attendance;
}

export const getStudentDailyGrades = async (studentId: string, date: string, signal?: AbortSignal): Promise<StudentDailyGrade[]> => {
    const response = await api.get(`parents/student/${studentId}/daily/grades`, {
        params: { date },
        signal
    });
    return response.data.grades;
}

export const getAccumulatedData = async(studentId: string, classId: string, periodId: string, subjectName: string, controller: any): Promise<SubjectAccumulated> => {
    const response = await api.get(`parents/student/${studentId}/accumulated`, {
        signal: controller.signal,
        params: {
            classId,
            periodId,
            subjectName
        }
    })
    return response.data.accumulated;
}