import type {
    CourseFailStat,
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary, HonorStudent
} from "../types/types.ts";
import api from "../../../api/client.ts";
import type { StudentInfraction } from "../../class-managment/types/types.ts";
import type { Student } from "../../../features/types/types.ts";

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

export const getCourseStudents = async (courseId: string, signal?: AbortSignal): Promise<Student[]> => {
    const response = await api.get(`/api/cumulative/${courseId}/reports/students`, { signal });
    return response.data.students;
}

export const getCumulativeFailStats = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<CourseFailStat[]> => {
    const response = await api.get(`/api/cumulative/course/${courseId}/fail-stats`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.stats;
}

export const getCumulativeHonorStudents = async (courseId: string, periodId: string, signal?: AbortSignal): Promise<HonorStudent[]> => {
    const response = await api.get(`/api/cumulative/course/${courseId}/honor-students`, {
        signal,
        params: {
            periodId
        }
    });
    return response.data.honor;
}

export const getStudentInfractions = async (courseId: string, studentId: string, signal?: AbortSignal): Promise<StudentInfraction[]> => {
    const response = await api.get(`/api/coexistence/course/${courseId}/student/${studentId}/infractions`, {
        signal
    });
    return response.data.infractions;
}

