import { useEffect, useState } from "react";
import { getCumulativeGrades } from "../../api";
import type { CumulativeGrades } from "../../types/types.ts";

export const useCumulativeGrades = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [grades, setGrades] = useState<CumulativeGrades[]>([]);

    useEffect(() => {
        if (!courseId || !periodId) return;

        const controller = new AbortController();

        const getGrades = async () => {
            setLoading(true);
            setError("");

            try {
                const records = await getCumulativeGrades(courseId, periodId, controller.signal);
                if (!controller.signal.aborted) {
                    setGrades(records);
                }
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Ocurrió un error al cargar las notas";

                setError(errorMessage);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        getGrades();

        return () => controller.abort();
    }, [courseId, periodId]);

    return { loading, error, grades };
};