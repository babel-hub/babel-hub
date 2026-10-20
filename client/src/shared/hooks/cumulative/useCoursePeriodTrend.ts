import { useEffect, useState } from "react";
import { getPeriodTrends } from "../../api";
import type { CoursePeriodTrend } from "../../types/types.ts";

export const useCoursePeriodTrend = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [trend, setTrend] = useState<CoursePeriodTrend[]>([]);

    useEffect(() => {
        const fetchTrends = async () => {
            if (!courseId || !periodId) return;

            setLoading(true);
            setError("");

            try {
                const result = await getPeriodTrends(courseId, periodId);
                setTrend(result);
            } catch (error: any) {
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Ocurrió un error al cargar los periodos";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        fetchTrends();
    }, [courseId, periodId]);

    return { loading, error, trend };
}