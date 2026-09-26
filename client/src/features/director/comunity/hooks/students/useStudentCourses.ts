import { useState, useEffect } from "react";
import type { Courses } from "../../types";
import { getCourses } from "../../api";

export const useStudentCourses = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [courses, setCourses] = useState<Courses[]>([]);

    useEffect(() => {
        const fetchCoursesForDropdown = async () => {
            setLoading(true);
            try {
                const response = await getCourses();
                setCourses(response);
            } catch (error) {
                setError("Error al cargar los cursos");
            } finally {
                setLoading(false);
            }
        };
        fetchCoursesForDropdown();
    }, [])

    return { loading, error, courses }
}