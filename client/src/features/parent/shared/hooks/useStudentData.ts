import { useState, useEffect } from "react";
import type { ParentStudent } from "../types/types.ts";
import { getParentStudents } from "../api";

export const useStudentData = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<ParentStudent[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getParentStudents();
                setStudents(response);
            } catch (error : any) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    return { loading, students };
}