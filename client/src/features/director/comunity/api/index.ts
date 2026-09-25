import api from "../../../../api/client.ts";
import type {CreateStudent, CreateTeacher, UpdateTeacher, UpdateStudent, Courses, StudentProps, Parent} from "../types";

//Students Endpoints

export const getStudents = async (): Promise<StudentProps[]> => {
    const response = await api.get("/student");
    return response.data.students;
}

export const getStudentById = async (id: string, periodId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/student/${id}`, {
        params: {
            periodId,
            startDate,
            endDate
        }
    });
    return response.data.studentProfile;
}

export const getCourses = async (): Promise<Courses[]> => {
    const response = await api.get('/courses');
    return response.data.courses;
}

export const createStudent = async (payload: CreateStudent) => {
    await api.post("/student", payload);
}

export const uploadStudent = async (studentId: string, payload: UpdateStudent) => {
    await api.put(`/student/${studentId}`, payload);
}

export const deleteStudent = async (id: string) => {
    await api.delete(`/student/${id}`);
}

//Teachers Endpoint

export const getTeacherById = async (id: string) => {
    const response = await api.get(`/teacher/${id}`);
    return response.data;
}

export const createTeacher = async (payload: CreateTeacher) => {
    await api.post("/teacher", payload);
}

export const updateTeacher = async (id: string, payload: UpdateTeacher) => {
    await api.put(`/teacher/${id}`, payload);
}

export const deleteTeacher = async (id: string) => {
    await api.delete(`/teacher/${id}`);
}

// Parents Endpoints

export const getParents = async (): Promise<Parent[]> => {
    const response = await api.get("/parents");
    return response.data.parents;
}

export const getStudentsByName = async (query: string) =>{
    const response = await api.get('student/search', {
        params: {
            q: query,
            limit: 10
        }
    });
    return response.data.students;
}

export const createParent = async (payload: any): Promise<void> => {
    await api.post("/parents", payload);
}

export const linkStudentToParent = async (payload: any) => {
    await api.post("/parents/link", payload);
}

export const deleteParent = async (id: string): Promise<void> => {
    await api.delete(`/parents/${id}`);
}