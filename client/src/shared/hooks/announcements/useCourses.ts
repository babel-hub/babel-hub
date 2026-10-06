import { useState, useEffect } from "react";
import { getCourses } from "../../api";
import type { CoursesListData } from "../../../features/director/course-management/types";

export const useCourses = (type: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [courses, setCourses] = useState<CoursesListData[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (type !== "COURSE") return;


            setLoading(true);
            setError("");
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message
                    || err.message
                    || "Error al cargar los cursos";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [type]);

    return { loading, error, courses };
}