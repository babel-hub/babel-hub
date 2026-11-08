import api from "../../../api/client";
import type {
    AssignmentsOverview,
    ClassAttendance,
    CourseAttendance,
    InfractionType,
    StudentInfraction,
    StudentMonitoring
} from "../../../features/types/types.ts";
import type {PrincipalClassData, TeacherClassData} from "../types/types.ts";

// ==========================================
// Class Details
// ==========================================

// Used by Principal / Director
export const getClass = async (id: string, signal?: AbortSignal): Promise<PrincipalClassData> => {
    const response = await api.get(`/classes/${id}`, { signal });
    return response.data;
};

// Used by Teacher
export const getTeacherClass = async (id: string, signal?: AbortSignal): Promise<TeacherClassData> => {
    const response = await api.get(`/classes/${id}/teacher`, { signal });
    return response.data.teacherClass;
};

// ==========================================
// Attendance
// ==========================================

export const getDailyAttendance = async (classId: string, date: string, signal?: AbortSignal): Promise<ClassAttendance[]> => {
    const response = await api.get(`/attendance/class/${classId}`, {
        signal,
        params: { date }
    });
    return response.data.records;
};

export const getPeriodAttendance = async (courseId: string, classId: string, startDate: string, endDate: string, signal?: AbortSignal): Promise<CourseAttendance[]> => {
    const response = await api.get(`/attendance/course/${courseId}/class/${classId}`, {
        signal,
        params: { startDate, endDate }
    });
    return response.data.attendanceClass;
};

export const saveBulkAttendance = async (id: string, date: string, records: any[]): Promise<void> => {
    return await api.post(`/attendance/class/${id}/bulk`, { date, records });
};

// ==========================================
// Coexistence (Infractions & Monitoring)
// ==========================================

export const getStudentInfractions = async (classId: string, studentId: string, signal?: AbortSignal): Promise<StudentInfraction[]> => {
    const response = await api.get(`/api/coexistence/class/${classId}/student/${studentId}/infractions`, { signal });
    return response.data.infractions;
};

export const getStudentMonitoring = async (courseId: string, studentId: string, signal?: AbortSignal): Promise<StudentMonitoring[]> => {
    const response = await api.get(`/api/coexistence/course/${courseId}/student/${studentId}/monitoring`, { signal });
    return response.data.monitoring;
};

export const getInfractionTypes = async (signal?: AbortSignal): Promise<InfractionType[]> => {
    const response = await api.get(`/api/coexistence/infraction-types`, { signal });
    return response.data.types;
};

export const createInfraction = async (classId: string, payload: any): Promise<void> => {
    await api.post(`/api/coexistence/class/${classId}/infractions`, payload);
};

export const updateInfraction = async (infractionId: string, payload: any): Promise<void> => {
    await api.put(`/api/coexistence/infraction/${infractionId}`, payload);
};

export const deleteInfraction = async (infractionId: string): Promise<void> => {
    await api.delete(`/api/coexistence/infraction/${infractionId}`);
};

export const escalateInfraction = async (infractionId: string, payload: any): Promise<void> => {
    await api.post(`/api/coexistence/infraction/${infractionId}/escalate`, payload);
}

// ==========================================
// Assignments
// ==========================================

export const getAssignmentOverview = async (courseId: string, classId: string, periodId: string, signal?: AbortSignal): Promise<AssignmentsOverview> => {
    const response = await api.get(`/assignments/periods/${periodId}/overview`, {
        signal,
        params: { courseId, classId }
    });
    return response.data.assignments;
};

export const createAssignment = async (payload: any): Promise<void> => {
    return await api.post(`/assignments`, payload);
};

export const updateAssignment = async (assignmentId: string, payload: any): Promise<void> => {
    return await api.patch(`/assignments/${assignmentId}`, payload);
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
    return await api.delete(`/assignments/${assignmentId}`);
};

// ==========================================
// Grades
// ==========================================

export const bulkGrades = async (classId: string, assignmentId: string, payload: any): Promise<void> => {
    return await api.post(`/grades/class/${classId}/assignment/${assignmentId}`, {
        records: payload
    });
};