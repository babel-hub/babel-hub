import { useState, useEffect } from "react";
import { getCumulativeReports } from "../../api";
import type { ReportStudentRow } from "../../types/types.ts";

export const useCumulativeReports = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [students, setStudents] = useState<ReportStudentRow[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;

            setLoading(true);
            setError("");

            try {
                const response = await getCumulativeReports(courseId);
                setStudents(response);
            } catch (error : any) {
                const errorMessage = error.message
                    || error.data.message
                    || "Ocurrio un error al cargar los estudiantes";

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [courseId]);

    return { loading, error, students };
}