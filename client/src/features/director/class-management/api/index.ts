import api from "../../../../api/client.ts";
import type { ClassDetailsData } from "../types";
import type {
    AssignmentsOverview,
    ClassAttendance,
    InfractionType,
    StudentInfraction,
    StudentMonitoring
} from "../../../types/types.ts";

export const getClass = async (id: string): Promise<ClassDetailsData> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
}
export const saveBulkAttendance = async (id: string, date: string, records: any[]): Promise<void> => {
    return await api.post(`/attendance/class/${id}/bulk`, { date, records });
};

export const getAttendanceClass = async (courseId: string , classId: string, startDate: string, endDate: string, signal?: AbortSignal) => {
    const response = await api.get(`/attendance/course/${courseId}/class/${classId}`, {
        signal,
        params: {
            startDate,
            endDate
        }
    });
    return  response.data;
};

export const getDailyAttendance = async (classId: string, date: string, signal?: AbortSignal): Promise<ClassAttendance[]> => {
    const response = await api.get(`/attendance/class/${classId}`, {
        signal,
        params: {
            date
        }
    });
    return response.data.records;
};

export const getStudentInfractions = async (classId: string, studentId: string, signal?: AbortSignal): Promise<StudentInfraction[]> => {
    const response = await api.get(`/api/coexistence/class/${classId}/student/${studentId}/infractions`, {
        signal
    });
    return response.data.infractions;
}

export const getStudentMonitoring= async (courseId: string, studentId: string, signal?: AbortSignal): Promise<StudentMonitoring[]> => {
    const response = await api.get(`/api/coexistence/course/${courseId}/student/${studentId}/monitoring`, {
        signal
    });
    return response.data.monitoring;
}

export const getInfractionTypes= async (signal?: AbortSignal): Promise<InfractionType[]> => {
    const response = await api.get(`/api/coexistence/infraction-types`, {
        signal
    });
    return response.data.types;
}


export const createInfraction= async (classId: string, payload: any): Promise<void> => {
    await api.post(`/api/coexistence/class/${classId}/infractions`, payload);
}


// Assignment Endpoints

export const getAssignmentOverview = async (courseId: string, classId: string, periodId: string, signal?: AbortSignal): Promise<AssignmentsOverview> => {
    const response = await api.get(`/assignments/periods/${periodId}/overview`, {
        signal,
        params: {
            courseId,
            classId,
        }
    });
    return response.data.assignments;
}

export const createAssignment = async (payload: any): Promise<void> => {
    return await api.post(`/assignments`, payload);
}

export const updateAssignment = async (assignmentId: string, payload: any): Promise<void> => {
    return await api.patch(`/assignments/${assignmentId}`, payload);
}

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
    return await api.delete(`/assignments/${assignmentId}`);
}

// Grade Endpoint

export const bulkGrades = async (classId: string, assignmentId: string, payload: any): Promise<void> => {
    return await api.post(`/grades/class/${classId}/assignment/${assignmentId}`, {
        records: payload
    });
}