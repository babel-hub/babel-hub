import { useState, useEffect } from "react";
import type { CourseFailStat, HonorStudent } from "../types/types.ts";
import { getCumulativeFailStats, getCumulativeHonorStudents } from "../api";

export const useCumulativeReports = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [failStats, setFailStats] = useState<CourseFailStat[]>([]);
    const [honorStudents, setHonorStudents] = useState<HonorStudent[]>([]);

    useEffect(() => {
        if (!courseId) return;

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const [failStatsData, honorStudentsData] = await Promise.all([
                    getCumulativeFailStats(courseId, periodId, controller.signal),
                    getCumulativeHonorStudents(courseId, periodId, controller.signal)
                ]);

                if (!controller.signal.aborted) {
                    setFailStats(failStatsData);
                    setHonorStudents(honorStudentsData);
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
    }, [courseId, periodId]);

    return { loading, error, failStats, honorStudents };
};