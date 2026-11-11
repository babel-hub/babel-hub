import type {
    InfractionTypeHierarchy,
    MonitoringMessage,
    StudentInfraction,
    StudentMonitoring
} from "../types/types.ts";
import api from "../../../api/client.ts";

export const getStudentInfractions = async (classId: string, studentId: string, signal?: AbortSignal): Promise<StudentInfraction[]> => {
    const response = await api.get(`/api/coexistence/class/${classId}/student/${studentId}/infractions`, { signal });
    return response.data.infractions;
};

export const getStudentMonitoring = async (courseId: string, studentId: string, signal?: AbortSignal): Promise<StudentMonitoring[]> => {
    const response = await api.get(`/api/coexistence/course/${courseId}/student/${studentId}/monitoring`, { signal });
    return response.data.monitoring;
};

export const getInfractionTypes = async (signal?: AbortSignal): Promise<InfractionTypeHierarchy[]> => {
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
};

export const getMonitoringMessages = async (monitoringId: string, signal?: AbortSignal): Promise<MonitoringMessage[]> => {
    const response = await api.get(`/api/coexistence/monitoring/${monitoringId}/messages`, { signal });
    return response.data.messages;
};

export const createMonitoringMessage = async (monitoringId: string, message: string): Promise<MonitoringMessage> => {
    const response = await api.post(`/api/coexistence/monitoring/${monitoringId}/messages`, { message });
    return response.data.message;
};