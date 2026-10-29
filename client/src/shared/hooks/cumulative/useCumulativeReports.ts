import { useState, useEffect } from "react";
import { getCumulativeReports } from "../../api";
import type { ReportStudentRow } from "../../types/types.ts";

export const useCumulativeReports = (courseId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [students, setStudents] = useState<ReportStudentRow[]>([]);

    useEffect(() => {
        if (!courseId) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getCumulativeReports(courseId, controller.signal);
                if (!controller.signal.aborted) {
                    setStudents(response);
                }
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Ocurrió un error al cargar los estudiantes";

                setError(errorMessage);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchData();

        return () => controller.abort();
    }, [courseId]);

    return { loading, error, students };
};