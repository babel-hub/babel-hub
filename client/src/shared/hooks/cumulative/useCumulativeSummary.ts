import { useEffect, useState } from "react";
import { getCumulativeSummary } from "../../api";
import type { CumulativeSummary } from "../../types/types.ts";

export const useCumulativeSummary = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [summary, setSummary] = useState<CumulativeSummary[]>([]);

    useEffect(() => {
        if (!courseId || !periodId) return;

        const controller = new AbortController();

        const getSummary = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getCumulativeSummary(courseId, periodId, controller.signal);
                setSummary(response);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Ocurrió un error al cargar el resumen"
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        getSummary();
        return () => controller.abort();
    }, [courseId, periodId]);

    return { loading, error, summary };
};