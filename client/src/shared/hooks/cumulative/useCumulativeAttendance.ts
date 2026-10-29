import { useState, useEffect } from 'react';
import { getCumulativeAttendance } from "../../api";
import type { CumulativeAttendance } from "../../types/types.ts";

export const useCumulativeAttendance = (courseId: string, periodId: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [attendance, setAttendance] = useState<CumulativeAttendance[]>([]);

    useEffect(() => {
        if (!courseId || !periodId) return;

        const controller = new AbortController();

        const fetchAttendance = async () => {
            setLoading(true);
            setError("");

            try {
                const result = await getCumulativeAttendance(courseId, periodId, controller.signal);
                if (!controller.signal.aborted) {
                    setAttendance(result);
                }
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

                const errorMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Ocurrió un error al cargar la asistencia";
                setError(errorMessage);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchAttendance();

        return () => controller.abort();
    }, [courseId, periodId]);

    return { loading, error, attendance };
};