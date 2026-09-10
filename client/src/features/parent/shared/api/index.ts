import api from "../../../../api/client.ts";
import type { ParentStudent } from "../types/types.ts";

export const getParentStudents = async (): Promise<ParentStudent[]> => {
    const response = await api.get('parents/students');
    return response.data.student
}