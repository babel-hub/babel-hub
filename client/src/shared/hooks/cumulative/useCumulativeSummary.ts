import { useEffect, useState } from "react";
import { getCumulativeSummary } from "../../api";
import type { CumulativeSummary } from "../../types/types.ts";

export const useCumulativeSummary = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [summary, setSummary] = useState<CumulativeSummary[]>([]);

    useEffect(() => {
        const getSummary = async () => {
            if (!courseId || !periodId) return;

            setLoading(true);
            setError("");
            try {
                const response = await getCumulativeSummary(courseId, periodId);
                setSummary(response);
            } catch (error : any) {
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Ocurrió un error al cargar el resumen";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
        getSummary();
    }, [courseId, periodId]);

    return { loading, error, summary };
}