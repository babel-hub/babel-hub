import api from "../../../../api/client.ts";
import type { ClassDetailsData } from "../types";
import type { AssignmentsOverview, ClassAttendance, Scales } from "../../../types/types.ts";

export const getClass = async (id: string): Promise<ClassDetailsData> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
}
export const saveBulkAttendance = async (id: string, date: string, records: any[]): Promise<void> => {
    return await api.post(`/attendance/class/${id}/bulk`, { date, records });
};

export const getAttendanceClass = async (courseId: string , classId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/attendance/course/${courseId}/class/${classId}?startDate=${startDate}&endDate=${endDate}`);
    return  response.data;
};

export const getDailyAttendance = async (classId: string, date: string): Promise<ClassAttendance[]> => {
    const response = await api.get(`/attendance/class/${classId}`, {
        params: {
            date
        }
    });
    return response.data.records;
};

// Assignment Endpoints

export const getAssignmentOverview = async (courseId: string, classId: string, periodId: string): Promise<AssignmentsOverview> => {
    const response = await api.get(`/assignments/periods/${periodId}/overview`, {
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

export const getClassScale = async (classId: string): Promise<Scales> => {
    const records = await api.get(`/scales/class/${classId}`);
    return records.data.scale;
}

export const bulkGrades = async (classId: string, assignmentId: string, payload: any): Promise<void> => {
    return await api.post(`/grades/class/${classId}/assignment/${assignmentId}`, {
        records: payload
    });
}