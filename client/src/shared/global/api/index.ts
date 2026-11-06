import api from "../../../api/client.ts";
import type {
    Area,
    Period, Scale,
    Teacher
} from "../types/types.ts";

export const getTeachers = async (): Promise<Teacher[]> => {
    const response = await api.get(`/teacher`);
    return response.data.teachers
}

export const getPeriods = async (): Promise<Period[]> => {
    const response = await api.get('/periods');
    return response.data.periods;
};

export const getAreas = async (): Promise<Area[]> => {
    const response = await api.get("/areas");
    return response.data.areas;
}

export const getScales = async (): Promise<Scale[]> => {
    const response = await api.get(`/scales`);
    return response.data.scales;
}
