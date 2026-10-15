import api from "../../../../api/client.ts";
import type {AvailableSubjects, CoursesListData, CreateClass, Teacher, UpdateClass, UpsertCourse} from "../types";

// Course List Endpoint

export const getCourses = async (): Promise<CoursesListData[]> => {
    const response = await api.get("/courses");
    return response.data.courses;
}

export const getTeachers = async (url: string, controller: any): Promise<Teacher[]> => {
    const response = await api.get(url, { signal: controller.signal });
    return response.data.teachers;
}

export const createCourse = async (payload: UpsertCourse) => {
    await api.post('/courses', payload);
}

export const updateCourse = async (id: string, payload: UpsertCourse) => {
    await api.put(`/courses/${id}`, payload);
}

export const deleteCourse = async (id: string) => {
    await api.delete(`/courses/${id}`);
}

// Course Details Endpoints

export const getCourse = async (id: string, controller: any) => {
    const response = await api.get(`/courses/${id}`, { signal: controller.signal });
    return response.data;
}

export const getAttendance  = async (id: string, date: string, controller: any) => {
    const response = await api.get(`/attendance/course/${id}/summary?date=${date}`, { signal: controller.signal });
    return response.data.records;
}

export const getAvailableSubjects = async (id: string): Promise<AvailableSubjects[]> => {
    const response = await api.get(`/subjects/available?courseId=${id}`);
    return response.data.availableSubjects;
}

export const createClass = async (payload: CreateClass) => {
    await api.post("/classes", payload);
}

export const updateClass = async (id: string, payload: UpdateClass) => {
    await api.put(`/classes/${id}`, payload);
}

export const deleteCLass = async (id: string) => {
    await api.delete(`/classes/${id}`)
}