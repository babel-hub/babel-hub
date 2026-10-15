import api from "../../../../api/client.ts";
import type { AreaDetails, GradingDetails, GradingTemplate } from "../types";

// Area Endpoints

export const createArea = async (payload: any): Promise<void> => {
    await api.post("/areas", payload)
}

export const updateArea = async (id: string, payload: any): Promise<void> => {
    await api.put(`/areas/${id}`, payload);
}

export const deleteArea = async (id: string): Promise<void> => {
    await api.delete(`/areas/${id}`);
}

export const getAreaDetails = async (id: string): Promise<AreaDetails> => {
    const response = await api.get(`/areas/${id}`);
    return response.data.areaDetails;
}

// Subject Endpoints

export const createSubject = async (payload: any): Promise<void> => {
    await api.post("/subjects", payload);
}

export const updateSubject = async (id: string, payload: any): Promise<void> => {
    await api.put(`/subjects/${id}`, payload);
}

export const deleteSubject = async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
}

// Periods Endpoints

export const createPeriod = async (payload: any): Promise<void> => {
    await api.post("/periods", payload);
}

export const updatePeriod = async (id: string, payload: any): Promise<void> => {
    await api.put(`/periods/${id}`, payload);
}

export const deletePeriod = async (id: string): Promise<void> => {
    await api.delete(`/periods/${id}`);
}

// Grading Template Endpoints

export const getGradingTemplates = async (): Promise<GradingTemplate[]> => {
    const response = await api.get(`/grading_templates`);
    return response.data.gradings;
}

export const getGradingDetails = async (gradingId: string): Promise<GradingDetails> => {
    const response = await api.get(`/grading_templates/${gradingId}`);
    return response.data.gradings_details;
}

export const createGradingTemplate = async (payload: any): Promise<void> => {
    await api.post(`/grading_templates`, payload);
}

export const updateGradingTemplate = async (gradingId: string, payload: any): Promise<void> => {
    await api.put(`/grading_templates/${gradingId}`, payload);
}

export const deleteGradingTemplate = async (gradingId: string): Promise<void> => {
    await api.delete(`/grading_templates/${gradingId}`);
}

// Assessment Criteria Endpoint

export const deleteAssessmentCriteria = async (id: string): Promise<void> => {
    await api.delete(`/assessments/${id}`);
}

export const createAssessmentCriteria = async (payload: any): Promise<void> => {
    await api.post(`/assessments`, payload);
}

export const updateAssessmentCriteria = async (id: string, payload: any): Promise<void> => {
    await api.put(`/assessments/${id}`, payload);
}