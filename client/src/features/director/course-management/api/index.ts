import api from "../../../../api/client.ts";
import type {
    AvailableSubjects, CourseBreak,
    CoursesListData,
    CreateBreakGroupPayload,
    CreateClass,
    Teacher, UpdateBreakGroupPayload,
    UpdateClass,
    UpsertCourse, UpsertSchedule
} from "../types";

// Course List Endpoint

export const getCourses = async (): Promise<CoursesListData[]> => {
    const response = await api.get("/courses");
    return response.data.courses;
}

export const getTeachers = async (url: string, controller: any): Promise<Teacher[]> => {
    const response = await api.get(url, { signal: controller.signal });
    return response.data.teachers;
}

export const createCourse = async (payload: UpsertCourse): Promise<void> => {
    await api.post('/courses', payload);
}

export const updateCourse = async (id: string, payload: UpsertCourse): Promise<void> => {
    await api.put(`/courses/${id}`, payload);
}

export const deleteCourse = async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
}

// Course Details Endpoints

export const getAvailableSubjects = async (id: string): Promise<AvailableSubjects[]> => {
    const response = await api.get(`/subjects/available?courseId=${id}`);
    return response.data.availableSubjects;
}

export const createClass = async (payload: CreateClass): Promise<string> => {
    const result = await api.post("/classes", payload);
    return result.data.classId;
}

export const createClassSchedule = async (classId: string, payload: UpsertSchedule[]) => {
    await api.post("/class-schedule", { payload, classId });
}

export const updateClass = async (id: string, payload: UpdateClass) => {
    await api.put(`/classes/${id}`, payload);
}

export const deleteCLass = async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`)
}

// Course breaks Endpoints

export const getCourseBreaks = async (courseId: string): Promise<CourseBreak[]> => {
    const response = await api.get(`/api/course-break/course/${courseId}`);
    return response.data.breaks;
}

export const createCourseBreaks = async (courseId: string, payload: CreateBreakGroupPayload): Promise<void> => {
    await api.post(`/api/course-break/course/${courseId}`, payload);
}
export const updateCourseBreakGroup = async (courseId: string, payload: UpdateBreakGroupPayload): Promise<void> => {
    await api.put(`/api/course-break/course/${courseId}/group`, payload);
}

export const deleteCourseBreakGroup = async (courseId: string, ids: string[]): Promise<void> => {
    await api.delete(`/api/course-break/course/${courseId}/group`, { data: { ids } });
}