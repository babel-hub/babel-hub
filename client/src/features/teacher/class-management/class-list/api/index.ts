import api from "../../../../../api/client.ts";
import type { TeacherClasses, TeacherCourse } from "../types";

export const getCLasses = async (): Promise<TeacherClasses[]> => {
    const response = await api.get("/classes/teacher/classes");
    return response.data.teacherClasses;
}

export const getCourse = async (): Promise<TeacherCourse> => {
    const response = await api.get("/courses/teacher/course");
    return response.data.teacherCourse;
}

export const createClassSchedule = async (payload: any) => {
    await api.post("/class-schedule", payload)
}