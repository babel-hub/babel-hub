import api from "../../../../api/client.ts";
import type {
    ClassFinalGrade
} from "../types/types.ts";

export const getStudentGrades = async (studentId: string, periodId: string): Promise<ClassFinalGrade[]> => {
    const response = await api.get(`parents/student/${studentId}/period/${periodId}/grades`);
    return response.data.grades;
}