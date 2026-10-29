import { useEffect, useState } from "react";
import { getPeriodTrends } from "../../api";
import type { CoursePeriodTrend } from "../../types/types.ts";

export const useCoursePeriodTrend = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [trend, setTrend] = useState<CoursePeriodTrend[]>([]);

    useEffect(() => {
        if (!courseId || !periodId) return;

        const controller = new AbortController();

        const fetchTrends = async () => {
            setLoading(true);
            setError("");

            try {
                const result = await getPeriodTrends(courseId, periodId, controller.signal);
                if (!controller.signal.aborted) {
                    setTrend(result);
                }
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Ocurrió un error al cargar los periodos";
                setError(errorMessage);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchTrends();

        return () => controller.abort();
    }, [courseId, periodId]);

    return { loading, error, trend };
};